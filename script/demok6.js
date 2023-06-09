import http from 'k6/http';
import {SharedArray} from 'k6/data';
import {Rate} from 'k6/metrics';
import {check} from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import {uuidv4} from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js';

//Ramp up based on iterations (ramping-arrival-rate). With this type of executors, the load emission is not conditioned by the performance of the application under test.
export let options = {
    //With "discardResponseBodies: true" the response body is discarded by default and is only enabled to parse and correlate data when "responseType: 'text'" is included in the request. This improves the performance of the script.
    discardResponseBodies: true,  
    //Multiple scenarios can be declared in the same script, and each one can independently execute a different JavaScript function.Every scenario can use a distinct VU and iteration scheduling pattern.
    scenarios: {
        login_pass: {
            executor: 'ramping-arrival-rate',
            exec: 'login_pass',
            startRate: 1,
            preAllocatedVUs: 5,
            timeUnit: '1m',
            maxVUs: 5,
            stages: [
                { target: 2, duration: '1m' },  
                { target: 1, duration: '1m' },                  
            ],
        },
        login_anonymous: {
            executor: 'ramping-arrival-rate',
            exec: 'login_anonymous',
            startRate: 1,
            timeUnit: '1m',
            preAllocatedVUs: 5,
            maxVUs: 5,
            stages: [
                { target: 2, duration: '1m' },
                { target: 3, duration: '1m' }
            ],
        },
    },
};

//Metrics
const myFailRate = new Rate('errorRate');

export function metrics(resp)
{
    myFailRate.add(resp.status !== 200)
    check(resp, {"status was 200": (r) => r.status == 200})
} 

//Data set
const URL = 'https://stg-client-api-gateway.pedidosya.com'

//Environment variable that receives from Jarvis with the name of the component that will be used to form the URL from which WireMock can be accessed (this line can be removed if it is set directly in the name of the component)
let APP = `${__ENV.APP}`
//The URL to access WireMock responds to the following pattern.
const WM = `http://wiremock-${APP}.apps.svc.cluster.local`


const userdata = new SharedArray("users", function() {return papaparse.parse(open('users.csv'), { header: true }).data;});
let scenary
scenary = ''

export function logicflow(){ 
    //Example of a call to a mocked endpoint.
    let resp_wiremock= http.get(`${WM}/get/first`, { }, {responseType: 'text', tags:{ name: '/wiremock/get/first'}})
    metrics(resp_wiremock)

    let randomUser = {}
    randomUser = userdata[Math.floor(Math.random() * userdata.length)] 

    let countryid = randomUser.countryid
    function GetGlobalent(cid) {
        const countries = {
            "1": ["Uruguay","PY_uy"],
            "2": ["Chile","PY_cl"],
            "3": ["Argentina", "PY_ar"],
            "7": ["Perú", "PY_pe"],
            "8": ["Venezuela", "PY_ve"],
            "11": ["Panamá", "PY_pa"],
            "13": ["Ecuador", "PY_ec"],
            "15": ["Paraguay", "PY_py"],
            "16": ["Costa Rica", "PY_cr"],
            "17": ["Bolivia", "PY_bo"],
            "18": ["Republica Dominicana", "PY_do"],
            "19": ["El Salvador", "PY_sv"],
            "20": ["Nicaragua", "PY_ni"],
            "21": ["Guatemala", "PY_gt"],
            "22": ["Honduras", "PY_hn"],
        }
        return countries[cid]
    }
    let device_id, session_id, time, apitoken, token, resp_login, requestname
    device_id = session_id = time = apitoken = token = resp_login = requestname = ''
    session_id =  uuidv4()  
    device_id = (Math.random()*1e29).toString(36).slice(2)
    time = Date.now()/1000

    let headers={'Content-Type': 'application/json; charset=UTF-8', 'Accept-Encoding': 'gzip', 'User-Agent': 'okhttp/3.14.0', 'Peya-Request-Type': 'load-test', 'Peya-Device-ID': device_id, 'Peya-Trace-ID': uuidv4(), 'Peya-App-Version': '5.5.13.2', 'Peya-App-Platform': 'android', 'Origin': 'PedidosYa', 'X-Trace-ID': session_id, 'Peya-Global-Entity-ID': GetGlobalent(countryid)[1], 'Peya-Session-ID': session_id, 'Peya-Session-Timestamp': time} 


    //appInit
    if(randomUser.email != undefined && randomUser.lat != undefined && randomUser.lon != undefined){
        let resp_appinit = http.post(`${URL}/mobile/v3/functions/appInit?app=android&hash= `, {}, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v3/functions/appInit'}})    
        metrics(resp_appinit) 

        if(resp_appinit.error_code == 0){
            let at = JSON.parse(resp_appinit.body)
            let apitoken1 = jsonpath.query(at, 'LoginSystemResult.APIToken')
            let apt = `${apitoken1}`      
            apitoken = apt.replace('Bearer ','')
            headers['Authorization'] = apitoken
        
            //City
            let cityresp = http.get(`${URL}/mobile/v2/locations/city?lat=${randomUser.lon}&lng=${randomUser.lat}`, {headers: headers, tags:{ name: '/mobile/v2/location/city'}})
            metrics(cityresp)

            //Home
            //The encodeURI() function encodes a URI by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character
            let url_enc = encodeURI(`${URL}/v5/home?area_id=${randomUser.area}&country_id=${randomUser.countryid}&lat=${randomUser.lat}&lng=${randomUser.lon}&city_name=${randomUser.cityname}`)
            let home = http.get(url_enc, {headers: headers, tags:{ name: '/v5/home'}})
            metrics(home)
        }
    }
    //Logueo
    if(scenary == 'logueo'){  
        if(apitoken != undefined){
            let payload = JSON.stringify({'countryId': randomUser.countryid, 'userName': randomUser.email, 'password': 't3std3m0'})
            resp_login = http.post(`${URL}/mobile/v1/users/login?extendedInfo=true`, payload, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v1/users/login'}})
            metrics(resp_login)
                if(resp_login.error_code == 0){
                    let logueo = JSON.parse(resp_login.body)
                    token = logueo['access_token']         
                }
        } 
    }
    else {
        token = apitoken    
    }
}

export function login_pass() {
    scenary = 'logueo', 
    logicflow() 
}
export function login_anonymous() {
    scenary = 'anonymous'
    logicflow() 
}