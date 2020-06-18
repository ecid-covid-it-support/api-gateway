const errorHandler = require('./../../utils/error.handler')
const deviceDao = require('./../device-pki/pki.dao')

const isProd = process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production'
const msgInternalError = {
    code: 500, message: 'An operation could not be completed due to an internal error...'
}

module.exports = () => {
    return async (req, res, next) => {
        try {
            // 1. retrieving serialNumber and deviceId from certificate
            const deviceId = req.socket.getPeerCertificate(true).subject.CN
            const serialNumber = req.socket.getPeerCertificate(true).serialNumber
            const device = await deviceDao.getCertInfo(deviceId)

            // 2. comparing the certificate's serialNumber with the serialNumber maintained at the gateway
            if (!device.serial_number || device.serial_number.replace(/:/g,'') != serialNumber.toLowerCase()) {
                return errorHandler(403, res)
            }

            next()
        } catch (e) {
            res.status(msgInternalError.code).json(msgInternalError)
        }

    }
}
