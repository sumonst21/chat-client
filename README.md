### Imap Chat _(PRATICAL)_
A websocket chat with php [Rachet](http://socketo.me/)

## Purpose
A chat system for your website clients. This will send a chat invitation to your email after the client initializes the chat.

## Usage
 - Start socket sever
```shell script
php socket.php
```
 - Open `index.html` with two(or more) different browser or tabs.
 
## Documentation
HTML code sample (This will be reference the the documentation below)
```haml
<div id="wrapper">

    <div id="user-container">
        <input type="text" id="name" name="name" placeholder="Name" required>
        <input type="email" id="email" name="email" placeholder="Email" required>
        <button type="button" id="join-chat">Join Chat</button>
    </div>

    <div id="chat-container" class="hidden">
        <button type="button" id="leave-room">Leave Chat</button>
        <div id="messages"></div>
        <div id="msg-container" class="chat-msg-action">
            <textarea id="msg" name="msg"></textarea>
            <button type="button" id="send-msg">Send</button>
        </div>
    </div>

</div>
```

Methods
-----
                                                                                 
| Name                  | Return    | Description                               |
|-----------------------|-----------|-------------------------------------------|
| constructor           | ImapChat  | Initial client data (ex: name, email, id).|
| setInstanceData       | ImapChat  | Sets `instanceData` option.               |
| setMessageContainerId | ImapChat  | Sets `messageContainerId` option.         |
| setSendButtonId       | ImapChat  | Sets `sendButtonId` option.               |
| setInputID            | ImapChat  | Sets `inputID` option.                    |
| setOnLocalJoin        | ImapChat  | Sets `onLocalJoin` option.                |
| setOnClientJoin       | ImapChat  | Sets `onClientJoin` option.               |
| setSendTPL            | ImapChat  | Sets `sendTPL` option.                    |
| setReceiveTPL         | ImapChat  | Sets `receiveTPL` option.                 |
| setMutateBeforeSend   | ImapChat  | Sets `mutateBeforeSend` option.           |
| setMutateOnReceive    | ImapChat  | Sets `mutateOnReceive` option.            |
| run                   | void      | Initializes websocket chat                |

----

#### `constructor((object) options)` Creates Imap chat instance.
       
**_Options_** 

| Name          | Type     | Description                  |
|---------------|----------|------------------------------|
| options       | object   | Initial chat setup.          |
| websocketHost | string   | Websocket host (default: `ws://localhost:8080?`).|

**_Options Parameters_**

| Name               | Type     | Required  |
|--------------------|----------|-----------|
| instanceData       | object   | true      |
| messageContainerId | string   | true      |
| sendButtonId       | string   | true      |
| inputID            | string   | true      |
| onLocalJoin        | function | false     |
| onClientJoin       | function | false     |
| sendTPL            | function | true      |
| receiveTPL         | function | true      |
| mutateBeforeSend   | function | false     |
| mutateOnReceive    | function | false     |
| initIdentifier     | string   | false (This should not be modified unless a property called `INITIAL_SOCK_INSTANCE` exists in your `instanceData` |

    

**_Usage_**
```javascript
const imap = new ImapChat({
    instanceData: {name: 'foo', email: 'foo@bar,com'},
    messageContainerId: '#messages',
    inputID: '#msg',
    sendButtonId: '#send-msg',
    onLocalJoin: onLocalJoin,
    onClientJoin: onClientJoin,
    sendTPL: sent,
    receiveTPL: received,
    mutateBeforeSend: mutateAddImageAndTime,
    mutateOnReceive: mutateAddImageAndTime
});
```

----

#### `setInstanceData((object) payload)` Sets `ImapChat.instanceData` option.
       
**_Options_** 

| Name               | Type     | Description                                                                                                           |
|--------------------|----------|-----------------------------------------------------------------------------------------------------------------------|
| payload            | object   | These are data you want to share between clients. `msg` property is added to the object before sending it to the server(So `msg` is reserved) |

**_Usage_**
```javascript
const imap = new ImapChat();
imap.setInstanceData({name: 'foo', email: 'foo@bar,com'});
```

----

#### `setMessageContainerId((string) id)` Sets `ImapChat.messageContainerId` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|---------------------------------------------------------------|
| id            | string   | Sets the id of the HTML element where chat message will be rendered |

**_Usage_**
```javascript
const imap = new ImapChat();
imap.setMessageContainerId('#messages'); // #messages using the HTML snippet provided above.
```

---

#### `setSendButtonId((string) id)` Sets `ImapChat.sendButtonId` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|---------------------------------------------------------------|
| id            | string   | Sets the id of the button that submits `inputID` value on click. |

**_Usage_**
```javascript
const imap = new ImapChat();
imap.setSendButtonId('#send-msg'); // #send-msg using the HTML snippet provided above.
```

---

#### `setInputID((string) id)` Sets `ImapChat.inputID` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|---------------------------------------------------------------|
| id            | string   | Sets the id of the input element which value is to be submitted on `sendButtonId` click. |

**_Usage_**
```javascript
const imap = new ImapChat();
imap.setInputID('#msg'); // #msg using the HTML snippet provided above.
```

----

#### `setOnLocalJoin(callback)` Sets `ImapChat.onLocalJoin` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|---------------------------------------------------------------|
| callback            | function   | Sets a function that is called when a clients joins a chat room(Only Joined client will see this). An argument containing the initial payload(`ImapChat.setInstanceData`) is passed to this function. |

**_Usage_**
```javascript
const onLocalJoin = function (payload) {
  return `<div style="text-align: center">You Joined room as ${payload.name}.</div>`;
};

const imap = new ImapChat();
imap.setOnLocalJoin(onLocalJoin);
```
---

#### `setOnClientJoin(callback)` Sets `ImapChat.onClientJoin` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|---------------------------------------------------------------|
| callback            | function   | Sets a function that is called when a new clients joins an existing room (Joined client won't see this). An argument containing the initial payload(`ImapChat.setInstanceData`) is passed to this function. |

**_Usage_**
```javascript
const onClientJoin = function (payload) {
  return `<div>${payload.name} Joined the chat.</div>`
};

const imap = new ImapChat();
imap.setOnClientJoin(onClientJoin);
```
---

#### `setSendTPL(callback)` Sets `ImapChat.sendTPL` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|--------------------------------------------------------|
| callback            | function   | Sets function that returns the HTML elements of how sent message will be rendered in `ImapChat.messageContainerId` container. An argument containing the initial payload(`ImapChat.setInstanceData` with `msg`) is passed to this function. |

**_Usage_**
```javascript
const sent = function (payload) {
    return `<div class="container">
      <div>Me</div>
      <div class="content">${payload.msg}</div>
    </div>`
};

const imap = new ImapChat();
imap.setSendTPL(sent);
```
---

#### `setReceiveTPL(callback)` Sets `ImapChat.receiveTPL` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|--------------------------------------------------------|
| callback            | function   | Sets function that returns the HTML elements of how received message will be rendered in `ImapChat.messageContainerId` container. An argument containing the client(who sent the message) payload(`ImapChat.setInstanceData` with `msg`) is passed to this function. |

**_Usage_**
```javascript
const received = function (payload) {
    return `<div class="container">
      <div>${payload.name}</div>
      <div class="content">${payload.msg}</div>
    </div>`
};

const imap = new ImapChat();
imap.setReceiveTPL(received);
```
---

#### `setMutateBeforeSend(callback)` Sets `ImapChat.mutateBeforeSend` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|--------------------------------------------------------|
| callback            | function   | Sets a function that is called before payload is sent to server. |

**_Usage_**
```javascript
// Add time to payload before sending it to server
const mutateAddTime = function (payload) {
  payload.time  = new Date().toLocaleTimeString();
  return payload;
};

const imap = new ImapChat();
imap.setMutateBeforeSend(mutateAddTime);
```
---

#### `setMutateOnReceive(callback)` Sets `ImapChat.mutateOnReceive` option.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|--------------------------------------------------------|
| callback            | function   | Sets a function that is called when a response is gotten from server. |

**_Usage_**
```javascript
// Replace :) with 😀 (Note: this can also be done in the setReceiveTPL(() => {...here}))
const mutateAddEmoji = function (payload) {
  payload.msg = payload.msg.replace(':)', '😀');
  return payload;
};

const imap = new ImapChat();
imap.setMutateOnReceive(mutateAddEmoji);
```
---

#### `run(sandbox)` Starts chat client.
       
**_Options_** 

| Name               | Type     | Description                                            |
|--------------------|----------|--------------------------------------------------------|
| sandbox            | boolean   | If set to true, a chat prototype is generated. This comes in handy for UI development. |

**_Usage_**
```javascript
const imap = new ImapChat({
    instanceData: {name: 'foo', email: 'foo@bar,com'},
    messageContainerId: '#messages',
    inputID: '#msg',
    sendButtonId: '#send-msg',
    onLocalJoin: onLocalJoin,
    onClientJoin: onClientJoin,
    sendTPL: sent,
    receiveTPL: received,
    mutateBeforeSend: mutateAddImageAndTime,
    mutateOnReceive: mutateAddImageAndTime
});
imap.run(true);
```












