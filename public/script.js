const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo     = document.createElement('video');
myVideo.muted     = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream=>{
    addVideoStream(myVideo, stream);

    myPeer.on('call', call=>{
        call.answer(stream)
        const video = document.createElement('video');
        call.on('stream' ,userVideStream => {
            addVideoStream(video, userVideStream);
        })
    })

    socket.on('user-connected', (userId)=>{
        connectToNewUser(userId, stream);
    })
})

socket.on('user-disconnected', userId=>{
    if(peers[userId]) peers[userId].close();
})

const myPeer = new Peer(undefined,{
    host: '/',
    port: '3001'
}); 
myPeer.on('open', (userId)=>{
    socket.emit('join-room', roomId, userId);
})

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    })
    videoGrid.append(video);
}

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideStream =>{
        addVideoStream(video, userVideStream);
    })
    call.on('close', ()=>{
        video.remove();
    })

    peers[userId] = call
}