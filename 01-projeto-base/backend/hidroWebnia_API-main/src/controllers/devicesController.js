const Devices = require('../model/Devices')
const esp32Timer = require('../utils/time')
const { getTimerForDevice } = require('../utils/timeManager')
const { calculateDaysPassed } = require('../utils/cycleUtils')
const fs = require('fs')
const cloudinary = require('../config/cloudinary')

exports.getAllDevices = async (req, res) => {
    try {
        const query = req.user.role == "admin" ? {} : { user: req.user.id }
        const devices = await Devices.find(query)
        res.json(devices)
    } catch (err) {
        res.status(500).send(err)
    }
}

exports.getOneDevice = async (req, res) => {
    try {
        const query = req.user.role == "admin"
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id }

        const device = await Devices.findOne(query)

        if (!device) {
            return res.status(404).json({ msg: 'Dispositivo não encontrado!' })
        }

        console.log('Dados do dispositivo em getOneDevice:', device);
        res.json(device)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
}


exports.updateDevice = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            volume: req.body.volume,
            lastCycleUpdate: req.body.lastCycleDay
        }
        
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "hidroWebniaImages"
        })
            updateData.image = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const filter = req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, user: req.user.id }

        const updatedDevice = await Devices.findOneAndUpdate(filter, updateData, { new: true })
        
        if (!updatedDevice) {
            return res.status(404).json({ success: false, message: 'Device não encontrado' })
        }
        
        res.json({
            success: true,
            updatedDevice,
        })
    } catch (err) {
        res.status(500).send(err) 
    }
}

exports.addDevice = async (req, res) => {
    try {
        const deviceData = {
            name: req.body.name,
            description: req.body.description,
            volume: req.body.volume,
            lastCycleUpdate: req.body.lastCycleDay,
            user: req.user.id
        }
    
        if (req.file?.path) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "hidroWebniaImages" })
            deviceData.image = result.secure_url
            try { fs.unlinkSync(req.file.path) } catch {}
        }
    
        const device = new Devices(deviceData)
        await device.save()
        res.json(device)
    } catch(err) {
         res.status(500).send(err)
    }
}

exports.deleteDevices = async (req, res) => {
    try {
        const query = req.user.role == "admin" ? {} : { user: req.user.id }
        const device = await Devices.findOneAndDelete({ _id: req.params.id }, query)
        res.json(device)
    } catch(err) {
        res.status(500).send(err)
    }
}

exports.receiveESP32Data = async (req, res) => {
    try {
        console.log('Requisição recebida:', req.body)

        const now = new Date()
        const currentHour = now.toTimeString().slice(0, 5) 
        const currentDay = now.toISOString().split('T')[0] 

        const deviceId = req.params.id
        const esp32Timer = getTimerForDevice(deviceId)

        esp32Timer.start()

        const receivedMeasure = req.body.measures?.[0]
        const device = await Devices.findById(deviceId)

        if (!device) {
            console.log('Device não encontrado')
            return res.status(404).json({ success: false, message: 'Device não encontrado' })
        }

        const currentConductivity = receivedMeasure?.conductivity
        const desiredConductivity = device.desiredConductivity
        const volume = device.volume
        let calcinit = null
        let dripsol = null

        if (
            typeof currentConductivity === 'number' &&
            typeof desiredConductivity === 'number'
        ) {
            const fator = ((desiredConductivity - currentConductivity) / 1.24) * volume
            calcinit = parseFloat((fator * 0.54).toFixed(2))
            dripsol = parseFloat((fator * 0.46).toFixed(2))
        }

        let cycleDay = 1
        if (device.measures.length > 0) {
            const lastMeasure = device.measures[device.measures.length - 1]
            const lastCycleDay = lastMeasure.cycleDay || 1
            const lastDayRecorded = lastMeasure.day

            if (lastDayRecorded !== receivedMeasure?.day) {
                cycleDay = (lastCycleDay % 7) + 1
            } else {
                cycleDay = lastCycleDay
            }
        }

        const newMeasure = {
            ...receivedMeasure,
            cycleDay,
            onlineTime: esp32Timer.getElapsedTime(),
            calcinit,
            dripsol
        }

        device.measures.push(newMeasure)

        device.lastCycleUpdate = new Date()

        await device.save()

        esp32Timer.resetInactiveTime(() => {
            esp32Timer.stop()
        })

        res.json(device)
    } catch (err) {
        console.error('Erro no servidor:', err)
        res.status(500).send(err)
    }
}



exports.getGraphicsData = async (req, res) => {
    try {
        const today = new Date()
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(today.getDate() - 7)

        const query = req.user.role == "admin" ? {} : { user: req.user.id }
        const device = await Devices.findOne({ _id: req.params.id }, query)

        if (!device) {
            return res.status(404).json({ success: false, message: 'Device não encontrado' })
        }

        const recentMeasures = device.measures.filter(measure => {
            const measureDate = new Date(measure.timestamp)
            return measureDate >= sevenDaysAgo && measureDate <= today
        })

        res.json(recentMeasures)
    } catch (err) {
        res.status(500).send(err)
    }
}

exports.cycleDevices = async (req, res) => {
    try {
        const device = req.user.role === "admin"
            ? await Devices.findById(req.params.deviceId)
            : await Devices.findOne({ _id: req.params.deviceId, user: req.user.id });

        if (!device) return res.status(404).json({ error: 'Dispositivo não encontrado ou você não tem permissão.' })

        const newCycle = {
            startDate: new Date(),
            currentCycle: device.cycles.length > 0 ? device.cycles[device.cycles.length - 1].currentCycle + 1 : 1,
            daysPassed: 0,
            manualAdvance: true,
        }

        device.cycles.push(newCycle)
        device.lastCycleUpdate = newCycle.startDate
        await device.save()
        console.log('Dispositivo após iniciar novo ciclo em cycleDevices:', device);

        res.json({ message: 'Novo ciclo iniciado com sucesso', cycle: newCycle })
    } catch (err) {
        console.error('Erro ao iniciar novo ciclo:', err)
        res.status(500).json({ error: 'Erro ao iniciar novo ciclo', details: err.message })
    }
}