let tx;

/* ---------------- CHAT ---------------- */

function log(t){
    chat.innerHTML += t + "<br>";
    chat.scrollTop = chat.scrollHeight;
}

/* ---------------- BLUETOOTH ---------------- */

async function connect(){

    try{
        const device = await navigator.bluetooth.requestDevice({
            filters:[{namePrefix:"BBC micro:bit"}],
            optionalServices:[
                "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
            ]
        });

        const server = await device.gatt.connect();

        const service = await server.getPrimaryService(
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
        );

        tx = await service.getCharacteristic(
            "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
        );

        log("✅ Dave AI verbonden met micro:bit");

    }catch(e){
        log("❌ Bluetooth fout: " + e);
    }
}

/* ---------------- SERVO ---------------- */

function sendServo(angle){
    if(!tx) return;
    let data = new TextEncoder().encode(angle + "\n");
    tx.writeValue(data);
}

/* ---------------- MOUTH ---------------- */

function mouth(){
    return setInterval(()=>{
        sendServo(90);
        setTimeout(()=>sendServo(30), 80);
    }, 150);
}

/* ---------------- SPEAK ---------------- */

function speak(text){

    log("🤖 Dave AI: " + text);

    let utter = new SpeechSynthesisUtterance(text);
    utter.lang = "nl-NL";

    let m = mouth();

    utter.onend = ()=>{
        clearInterval(m);
        sendServo(30);
    };

    speechSynthesis.speak(utter);
}

/* ---------------- AI (OPENAI) ---------------- */

async function askAI(question){

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
           "Authorization: "Bearer sk-xxxxxx"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Je bent Dave, een grappige LEGO robot. Je praat vrolijk en kort."
                },
                {
                    role: "user",
                    content: question
                }
            ]
        })
    });

    const data = await response.json();

    return data.choices[0].message.content;
}

/* ---------------- SPEECH RECOGNITION ---------------- */

function listen(){

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SR){
        alert("Spraak niet ondersteund in deze browser");
        return;
    }

    let rec = new SR();
    rec.lang = "nl-NL";
    rec.start();

    log("🎤 Dave luistert...");

    rec.onresult = async (e)=>{

        let text = e.results[0][0].transcript;

        log("🧑 Jij: " + text);

        let reply = await askAI(text);

        speak(reply);
    };

    rec.onerror = (e)=>{
        log("❌ spraak fout: " + e.error);
    };
}

async function sendText(){

    let text = document.getElementById("inputText").value;

    if(text.trim() === "") return;

    log("🧑 Jij: " + text);

    // Gebruik echte AI:
    let reply = await askAI(text);

    // Of als je geen AI gebruikt:
    // let reply = brain(text);

    speak(reply);

    document.getElementById("inputText").value = "";
}
