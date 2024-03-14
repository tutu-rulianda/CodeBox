// Copyright © 2023 Tutu Rulianda
// The MIT License (MIT)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
// documentation files (the “Software”), to deal in the Software without restriction, including without limitation 
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
// and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions 
// of the Software.
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
// TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
// DEALINGS IN THE SOFTWARE.

import { useRef, useEffect } from 'react'
import { CompreFace } from '@exadel/compreface-js-sdk';
import './App.css';
import './style.css';

function App() {
  const ref = useRef(null);
  const videoTag = useRef(null);
  const canvas1 = useRef(null);
  const canvas2 = useRef(null);
  const canvas3 = useRef(null);

  const drawFace = (canvasElement, faceData, extraCanvas) => {
    const evt = new Event("next_frame", {"bubbles":true, "cancelable":false});
    document.dispatchEvent(evt);
    const n = faceData.result.length;

    canvasElement.clearRect(0, 0, 300, 400);
    extraCanvas.clearRect(0, 0, 300, 400);

    canvasElement.strokeStyle = 'blue';
    extraCanvas.strokeStyle = "white";    

    extraCanvas.lineWidth = 1;
    canvasElement.lineWidth = 2;

    let textAnnouncement = n.toString() + " image";
    if (n > 1) {
      textAnnouncement = textAnnouncement + "s";
    }
    textAnnouncement = textAnnouncement + " detected."

    extraCanvas.fillStyle = "red"
    extraCanvas.font = "13px arial";

    extraCanvas.fillRect(0, 0, 300, 25);
    extraCanvas.strokeText(textAnnouncement, 15, 17);

    extraCanvas.fillStyle = "blue"
    extraCanvas.font = "13px arial";

    for (let i = 0; i < n; i++) {      
      let similarity = faceData.result[i].subjects[0].similarity;
      let rectangle = faceData.result[i].box;
      let subject = faceData.result[i].subjects[0].subject;      

      let multiplier = 8;
      canvasElement.strokeRect(rectangle.x_min, rectangle.y_min, rectangle.x_max - rectangle.x_min, rectangle.y_max - rectangle.y_min);
      if (similarity.toFixed(2) < 0.95) {      
        subject = "Unknown";      
      }
      if (subject.length + 5 > 24) {
        multiplier = 7.23;
      }
      else if (subject.length + 5 < 13) {
        multiplier = 8.18;
      }
      else if (subject.length + 5 > 10) {
        multiplier = 6.797;
      }
      // const text = extraCanvas.measureText(subject);
      extraCanvas.fillRect(rectangle.x_min - 1, rectangle.y_min - 25, multiplier * (subject.length + 5), 25);
      extraCanvas.strokeText(similarity.toFixed(2) + ' ' + subject, rectangle.x_min + 5, rectangle.y_min - 7);
    }
  }
  
  const handleVideoStart = () => {
    navigator.mediaDevices.getUserMedia({ video: true})
      .then(stream => videoTag.current.srcObject = stream)
      .catch( error => console.error(error));

      videoTag.current.addEventListener('play', () => {
        // CompreFace init
        let server = "https://vault.tuturulianda.com";
        let port = 443;
        let recognition_key = "c86b70e0-ba3c-44f3-823e-dd848b02ad24";
  
        let core = new CompreFace(server, port);
        let recognition_service = core.initFaceRecognitionService(recognition_key);
        // end of CompreFace init
  
        let ctx1 = canvas1.current.getContext('2d');
        let ctx2 = canvas2.current.getContext('2d');
        let ctx3 = canvas3.current.getContext("2d");

        document.addEventListener('next_frame', () => {
          ctx1.drawImage(videoTag.current, 0, 0, 300, 400)
          canvas1.current.toBlob( blob => {
            recognition_service.recognize(blob, {  limit: 0, face_plugins: 'age,gender,pose' })
            .then(res => {
              // if (!res.ok) {
              //   throw new Error(res.status);
              // }
              drawFace(ctx2, res, ctx3)
            })            
            .catch(error => {
              if (error.message === '400') {
                  error.response.json().then(errorData => {
                     const errorMessage = errorData.message;
                     this.setState({ errorMessage });
                    //  console.log('SetState: ', errorMessage);
                     window.location.reload();
                     return; 
                  });
              } 
              else {
                  // if (error.message === "Request failed with status code 400") {
                  //   location.reload();
                  //   return;
                  // }
                  // console.log('This is: ', error.message);
                  window.location.reload();
                  return;
              }
            });
          }, 'image/jpeg', 0.95)
        })

        const evt = new Event("next_frame", {"bubbles":true, "cancelable":false});
			  document.dispatchEvent(evt);
      })
  }

  useEffect(() => {
    setTimeout(() => {
      ref.current.click();
    }, 50); //miliseconds
  }, []);

  return (
    <div>
      <div className="container-fluid">
        <div className="main col-md-9 col-md-offset-3">
          <div className="App">
            <header className="App-header">
              <video className="canvas" poster="https://probe2.tuturulianda.com/poster.png" width="300" height="400" ref={videoTag} autoPlay muted></video>
              <canvas className="canvas" ref={canvas1} id="canvas" width="300" height="400" style={{ display: 'none' }}></canvas>
              <canvas className="canvas" ref={canvas2} id="canvas2" width="300" height="400"></canvas>
              <canvas ref={canvas3} id="canvas3" width="300" height="400"></canvas>
              <div>
                <button style={{ display:'none'}} ref={ref} onClick={handleVideoStart}></button>                
              </div>
            </header>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
