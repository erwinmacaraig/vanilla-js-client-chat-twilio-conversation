

const client = new Twilio.Conversations.Client("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzk5NGJiNDI4MjkzYzI0OTkwN2NjYThlMjJkMDU5YjcxLTE2NzYwOTI0NzciLCJncmFudHMiOnsiaWRlbnRpdHkiOiJlcndpbiIsImNoYXQiOnsic2VydmljZV9zaWQiOiJJU2M1Mzg1Y2MyMGE5ZTQ5ZjVhNGU0ZWZkNjFmYmVlMjkzIn19LCJpYXQiOjE2NzYwOTI0NzcsImV4cCI6MTY3NjA5NjA3NywiaXNzIjoiU0s5OTRiYjQyODI5M2MyNDk5MDdjY2E4ZTIyZDA1OWI3MSIsInN1YiI6IkFDZTIzODM1YmEyNmFkNGU0YTBkZmQyMTQzMmFiYWMwN2YifQ.km0h7Aw9Yx4dxiiZm4tDMYoE1tbOL7lOvUWb-O_rx7o");

console.log(client);
let conversationChannels = [];
let statusString = '';
let currentChannel = undefined;

client.on("connectionStateChanged", (state) => { 
    
    console.log(state);
    /*** Here we manage the connection state */
    switch (state) { 
        case 'connecting':
            statusString = "Connecting to Twilio…";
            break
        case 'connected':
            statusString = "You are connected";
            break;
        case 'disconnecting':
            statusString = "Disconnecting from Twilio…";
            break;
        case 'disconnected':
            statusString = "Disconnected.";
            break;
        case 'denied':
            statusString = "Failed to connect.";
            break;

    }
    document.querySelector(".status-box").innerHTML = statusString;
});

client.on('conversationJoined', (channel) => { 
    currentChannel = channel;
    console.log("conversationJoined occurred");
    conversationChannels = [...conversationChannels, channel];
    // console.log(JSON.stringify(conversationChannels)); // TypeError: Converting circular structure to JSON
    // sessionStorage.setItem('channels',conversationChannels);
    // clear all child nodes first
    document.querySelector('.conversation-channels').innerHTML = '';
    //grab a reference to the DOM Element
    let channelsParentElement = document.querySelector(".conversation-channels");
    let headingElement = document.createElement('h3');
    headingElement.textContent = 'Conversations';
    channelsParentElement.appendChild(headingElement);

    let ulElem = document.createElement('ul');
    let liString = '';
    conversationChannels.forEach((channel) => { 
        liString += `<li><a onclick="showConversationMessages('${channel['sid']}')" href="#">${channel['friendlyName']}</a></li>`;
    });
    ulElem.innerHTML = liString;
    channelsParentElement.appendChild(ulElem);

    console.log(currentChannel.status); 


});

async function showConversationMessages(sid) { 
    console.log(sid);   
    currentChannel = conversationChannels.filter((convo) => {
        return convo['sid'] == sid;
    })[0];
    try {
        const messages = await currentChannel.getMessages();
        // clear
        document.querySelector('#messages').innerHTML = '';

        console.log(messages['items']);

        //build DOM 
        const conversationItems = messages['items'];
        let conversationItemsLists = '';
        conversationItems.forEach((item) => { 
            let _msg = '';
            let _divStyle = '';
            if (item['author'] == 'erwin') {
                _msg = 'outgoing_msg';
                _divStyle = 'sent_msg';
            } else { 
                _msg = 'received_msg';
                _divStyle = 'received_withd_msg';
            }
            conversationItemsLists += `<li class="conversation-item ${_msg}">
            <div class="${_divStyle}">
                <div>
                    <strong>${item['author']}</strong>
                    <br>
                    ${item['body']}
                </div>
                <span class="time_date">
                    ${new Date(item['dateCreated']).toLocaleString()}
                </span>
            </div>
            </li>`;
        });
        document.querySelector('#messages').innerHTML = conversationItemsLists;
        document.querySelector(".selected-channel").setAttribute('style', 'display: block');
    } catch (e) { 
        console.log(e);
    }
    
}

client.on("messageAdded", (message) => { 
    console.log(message);
    console.log('sid from message ', message['sid']);
    console.log('current channel sid ', currentChannel['sid']);
    console.log(message['sid'] != currentChannel['sid']);
    // check for the convesation sid 
    if (message['conversation']['sid'] != currentChannel['sid']) { 
        return;
        // no need to do display
    }
    const convoItemElems = document.querySelectorAll(".conversation-item");
    if (convoItemElems.length > 0) { 
        // append 
        const messagesDiv = document.querySelector('#messages');
        const newMessageListEl = document.createElement('li');

        let _msg = '';
        let _divStyle = '';
        if (message['author'] == 'erwin') {
            _msg = 'outgoing_msg';
            _divStyle = 'sent_msg';
        } else { 
            _msg = 'received_msg';
            _divStyle = 'received_withd_msg';
        }
        newMessageListEl.classList.add(`conversation-item`);
        newMessageListEl.classList.add(`${_msg}`);
         
        const html = `<div class="${_divStyle}">
                <div>
                    <strong>${message['author']}</strong>
                    <br>
                    ${message['body']}
                </div>
                <span class="time_date">
                    ${new Date(message['dateCreated']).toLocaleString()}
                </span>
            </div>`;

        newMessageListEl.innerHTML = html;
        messagesDiv.appendChild(newMessageListEl);
    } 

}); 

function sendMessage(event) { 
    console.log(event);
    event.preventDefault();
    const message = document.querySelector('#type-a-message').value;
    try {
        currentChannel.sendMessage(message);
        document.querySelector('#type-a-message').value = '';
    } catch (e) { 
        console.log(e);
    }
    return;
}










// initConversations = async () => {
//     const client = new Twilio.Conversations.Client(token);


    // window.conversationsClient = ConversationsClient;
    // this.conversationsClient = await ConversationsClient.create(this.state.token);
    // this.setState({
    //     statusString: "Connecting to Twilio…"
    // });

    // this.conversationsClient.on("connectionStateChanged", (state) => {
    //     if (state === "connecting")
    //         this.setState({
    //             statusString: "Connecting to Twilio…",
    //             status: "default"
    //         });
    //     if (state === "connected") {
    //         this.setState({
    //             statusString: "You are connected.",
    //             status: "success"
    //         });
    //     }
    //     if (state === "disconnecting")
    //         this.setState({
    //             statusString: "Disconnecting from Twilio…",
    //             conversationsReady: false,
    //             status: "default"
    //         });
    //     if (state === "disconnected")
    //         this.setState({
    //             statusString: "Disconnected.",
    //             conversationsReady: false,
    //             status: "warning"
    //         });
    //     if (state === "denied")
    //         this.setState({
    //             statusString: "Failed to connect.",
    //             conversationsReady: false,
    //             status: "error"
    //         });
    // });

    // this.conversationsClient.on("conversationJoined", (conversation) => {
    //     this.setState({
    //         conversations: [...this.state.conversations, conversation]
    //     });
    // });
    // this.conversationsClient.on("conversationLeft", (thisConversation) => {
    //     this.setState({
    //         conversations: [...this.state.conversations.filter((it) => it !== thisConversation)]
    //     });
    // });
// };