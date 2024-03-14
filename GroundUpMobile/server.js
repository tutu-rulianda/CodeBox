const express = require('express')
const path = require('path')
const { get } = require('request')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'weights')))
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceDetection.html')))
app.get('/face_detection', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceDetection.html')))
app.get('/face_landmark_detection', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceLandmarkDetection.html')))
app.get('/face_expression_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceExpressionRecognition.html')))
app.get('/age_and_gender_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'webcamAgeAndGenderRecognition.html')))
app.get('/2d_liveness_detection', (req, res) => res.sendFile(path.join(viewsDir, 'bioxmyjyi1bc.html')))
app.get('/3d_liveness_detection', (req, res) => res.sendFile(path.join(viewsDir, 'axeMobileT.html')))

app.listen(5778, () => console.log('Listening on port 5778!'))

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function(resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
      },
      returnBuffer ? { encoding: null } : {}
    )

    get(options, function(err, res) {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}
