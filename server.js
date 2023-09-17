const ws = require("ws")
const {Server} = ws
const  {v4} =require("uuid") 
const uuid = v4
const {writeFile,readFileSync,existsSync} = require("fs")

const clients = {}
const log = existsSync('log') && readFileSync('log')
const messages = JSON.parse(log) || []

const wss = new Server({port:5000})
wss.on("connection",(ws)=>{
    const id = uuid()
    clients[id] = ws

    console.log(`New client  ${id}`)
    ws.send(JSON.stringify(messages));

    ws.on('message',(rawMessage)=>{
        const {name,message} = JSON.parse(rawMessage)
        messages.push({name,message})
        for(const id in clients){
            clients[id].send(JSON.stringify([{name,message}]))
        }
        console.log(name)
    })

    ws.on('close',()=>{
        delete clients[id]
        console.log(`Client ${id} closed`)
    })
})

process.on('SIGINT',()=>{
    wss.close()
    writeFile('log',JSON.stringify(messages),err=>{
        if (err){
            console.log(err)
        }
        process.exit()
    })
    
})