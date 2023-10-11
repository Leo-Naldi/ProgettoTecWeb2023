require('dotenv').config();
const path = require('path')

module.exports = {
    dasboard_href: path.join(process.env.MODDASHBOARD_BASE, '/pages/dashboard.html')
}