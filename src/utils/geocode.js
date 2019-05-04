const axios = require('axios')
const request = require('request')

const app_id = "IhfpLf7BYoXsNAwGldcB"
const app_code = "Fx_xH5xC7zKa-cYdEZMhDg"
const base_url = "https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?app_id="


geocode = (long, lat, callback) => {
    const url = base_url + app_id + "&app_code=" + app_code + "&mode=retrieveAddresses&prox=" + long + "," + lat + ",100"
    console.log(url)
    request({ url, json: true }, (error, res) => {
        const city = res.body.Response.View[0].Result[0].Location.Address.City
        const province = res.body.Response.View[0].Result[0].Location.Address.State
        callback({
            city,
            province
        })
    })
}

module.exports = geocode
