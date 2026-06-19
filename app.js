let tx;

function log(text, type="bot"){
    let div = document.createElement("div");
    div.className = "msg " + type;
    div.innerHTML = text;
    chat.appendChild(div);
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

        log("✅ Verbonden met micro:bit 🤖");

    }catch(e){
        log("❌ Bluetooth fout: " + e, "user");
    }
}

/* ---------------- SERVO ---------------- */

function sendServo(angle){
    if(!tx) return;
    let data = new TextEncoder().encode(angle + "\n");
    tx.writeValue(data);
}

/* ---------------- MOUTH ANIMATION ---------------- */

function mouth(){
    return setInterval(()=>{
        sendServo(90);
        setTimeout(()=>sendServo(30), 80);
    }, 160);
}

/* ---------------- DAVE BRAIN ---------------- */

function brain(text){

    text = text.toLowerCase();

    if(text.includes("hallo")){
        return "Hoi! Ik ben LEGO Dave 😄";
    }

    if(text.includes("grap")){
        return "Waarom valt een robot nooit? Omdat hij altijd goed gebalanceerd is 😂";
    }

    if(text.includes("naam")){
        return "Ik ben Dave, jouw LEGO AI robot 🤖";
    }

    if(text.includes("hoe gaat")){
        return "Alles werkt perfect in mijn servo-systeem 😎";
    }

    return "Hmm 🤔 dat vind ik interessant!";
}

/* ---------------- SPEAK ---------------- */

function speak(text){

    log("🤖 Dave: " + text, "bot");

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
        alert("Spraak niet ondersteund in deze browser");
        return;
    }

    let rec = new SR();
    rec.lang = "nl-NL";
    rec.start();

    log("🎤 Dave luistert...", "bot");

    rec.onresult = (e)=>{

        let text = e.results[0][0].transcript;

        log("🧑 Jij: " + text, "user");

        let reply = brain(text);

        speak(reply);
    };

    rec.onerror = (e)=>{
        log("❌ fout: " + e.error, "user");
    };
}
