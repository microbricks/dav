let tx;

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

        log("✅ Verbonden met micro:bit!");

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

/* ---------------- DAVE BRAIN ---------------- */

function brain(text){

    text = text.toLowerCase();

    if(text.includes("hallo")){
        return "Hoi! Ik ben LEGO Dave 😄";
    }

    if(text.includes("grap")){
        return "Waarom valt een robot nooit? Omdat hij altijd stabiel is 😂";
    }

    if(text.includes("naam")){
        return "Ik ben Dave, jouw LEGO robot!";
    }

    return "Hmm 🤔 vertel me meer!";
}

/* ---------------- MOUTH ---------------- */

function mouth(){

    return setInterval(()=>{

        sendServo(90);

        setTimeout(()=>{
            sendServo(30);
        },90);

    },180);
}

/* ---------------- SPEAK ---------------- */

function speak(text){

    log("🤖 Dave: " + text);

    let utter = new SpeechSynthesisUtterance(text);
    utter.lang = "nl-NL";

    let m = mouth();

    utter.onend = ()=>{
        clearInterval(m);
        sendServo(30);
    };

    speechSynthesis.speak(utter);
}

/* ---------------- SPEECH ---------------- */

function listen(){

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SR){
        alert("Spraak niet ondersteund");
        return;
    }

    let rec = new SR();
    rec.lang = "nl-NL";
    rec.start();

    log("🎤 Luisteren...");

    rec.onresult = (e)=>{

        let text = e.results[0][0].transcript;

        log("🧑 Jij: " + text);

        let reply = brain(text);

        speak(reply);
    };
}
