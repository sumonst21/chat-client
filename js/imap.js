class ImapChat
{
  /**
   * Class constructor.
   *
   * @param {object} obj
   * @param {string} websocketHost
   *
   * $obj properties.
   * {object} instanceData
   * {string} messageContainerId
   * {string} inputId
   * {string} sendButtonId
   * {function} onLocalJoin
   * {function} onClientJoin
   * {function} sendTPL
   * {function} receiveTPL
   * {function} mutateBeforeSend
   * {function} mutateOnReceive
   */
  constructor(obj, websocketHost = 'ws://localhost:8080?') {
    this.instanceData       = obj.instanceData;
    this.messageContainerId = obj.messageContainerId;
    this.inputID            = obj.inputID;
    this.sendButtonId       = obj.sendButtonId;
    this.onLocalJoin        = obj.onLocalJoin || (() => '');
    this.onClientJoin       = obj.onClientJoin || (() => '');
    this.sendTPL            = obj.sendTPL;
    this.receiveTPL         = obj.receiveTPL;
    this.mutateBeforeSend   = obj.mutateBeforeSend || (e => e);
    this.mutateOnReceive    = obj.mutateOnReceive || (e => e);
    this.initIdentifier     = 'INITIAL_SOCK_INSTANCE';
    this.websocketHost      = websocketHost;
  }

  /**
   * Sets initial object for current client
   * @Example {name: 'foo', email: 'foo@bar.com'}
   * @param {object} obj
   */
  setInstanceData(obj) {
    this.instanceData = obj
  }

  /**
   * Sets the id of the HTML element where chat message will be rendered.
   * @Example: '#messages'
   * @param {string} messageContainerId
   */
  setMessageContainerId(messageContainerId) {
    this.messageContainerId = messageContainerId;
  }

  /**
   * Sets the id of the button that on click, $setInputID value will be submitted.
   * @Example '#submite-input'
   * @param {string} sendButtonId
   */
  setSendButtonId(sendButtonId) {
    this.sendButtonId = sendButtonId;
  }

  /**
   * Sets the id of the input element which value is to be posted on $setSendButtonId click.
   * @Example '#chat-msg-input'
   * @param {string} inputId
   */
  setInputID(inputId) {
    this.inputId = inputId;
  }

  /**
   * Sets a function that is called when a clients joins a chat room.
   *    Callback accepts an argument of payload, which contains current clients information.
   * @param {function} callback
   */
  setOnLocalJoin(callback) {
    this.onLocalJoin = callback;
  }

  /**
   * Sets a function that is called when a new clients joins an existing chat.
   *    Callback accepts an argument of payload, which contains the new clients information.
   * @param {function} callback
   */
  setOnClientJoin(callback) {
    this.onClientJoin = callback;
  }

  /**
   * How current client chat is rendered.
   * Sets a callback that displays content that will be rendered into $messageContainerId.
   *     Callback accepts an argument of payload, which contains the current clients/chat information.
   * @param {function} callback
   */
  setSendTPL(callback) {
    this.sendTPL = callback;
  }

  /**
   * How received chat is rendered.
   * Sets a callback that displays content that will be rendered into $messageContainerId.
   *     Callback accepts an argument of payload, which contains the received clients/chat information.
   * @param {function} callback
   */
  setReceiveTPL(callback) {
    this.receiveTPL = callback;
  }

  /**
   * Set a mutation for payload before send.
   *     Callback accepts an argument of payload, and must return the(modified) payload.
   * @param {function} callback
   */
  setMutateBeforeSend(callback) {
    this.mutateBeforeSend = callback;
  }

  /**
   * Set a mutation for payload after receive.
   *     Callback accepts an argument of payload, and must return the(modified) payload.
   * @param {function} callback
   */
  setMutateOnReceive(callback) {
    this.mutateOnReceive = callback;
  }

  /**
   * Eval
   * @param {boolean} sandbox If set to true, a chat prototype is rendered.
   */
  run(sandbox)
  {
    const panel = document.querySelector(this.messageContainerId);
    const input = document.querySelector(this.inputID);
    const send  = document.querySelector(this.sendButtonId);

    if (! panel)  {
      throw new Error(`Message Container[messageContainerId]. Couldn't find element with ID:"${this.messageContainerId}"`);
    }

    if (! this.onLocalJoin) {
      throw new Error('onJoin callback not specified[onLocalJoin].');
    }

    if (! this.sendTPL) {
      throw new Error('Sent message template callback not specified[sendTPL].');
    }

    if (! this.receiveTPL) {
      throw new Error('Received message template callback not specified[receiveTPL].');
    }

    if (! input) {
      throw new Error(`Message Input[inputID]. Couldn't find element with ID:"${this.inputID}"`);
    }

    if (sandbox) {
      return this.buildDev(panel);
    }

    const params = Object.assign({[this.initIdentifier]: true}, this.instanceData);
    const conn   = new WebSocket(this.websocketHost + JSON.stringify(params));

    conn.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data[this.initIdentifier]) {
        panel.innerHTML += this.onClientJoin(data);
      } else {
        panel.innerHTML += this.receiveTPL(this.mutateOnReceive(data));
      }
    };

    if (! send) {
      throw new Error(`Send message button[sendButtonId]. Couldn't find element with ID:"${this.sendButtonId}"`);
    } else  {
      send.addEventListener('click', () => {
        const message = input.value;

        if (! message)  {
          return;
        }

        this.instanceData.msg = message;
        conn.send(JSON.stringify(this.instanceData));
        panel.innerHTML += this.sendTPL(this.mutateBeforeSend(this.instanceData));
      });
    }

    panel.innerHTML = this.onLocalJoin(this.instanceData);
  }

  /**
   * Sets up UI for development.
   * @param panel
   */
  buildDev(panel)
  {
    const clientEmail = this.instanceData.email;
    panel.innerHTML = '<hr />';
    panel.innerHTML += this.onLocalJoin(this.instanceData);
    panel.innerHTML += this.onClientJoin(this.instanceData);
    this.instanceData.msg = 'Hello Foo!';
    panel.innerHTML += this.sendTPL(this.mutateBeforeSend(this.instanceData));
    this.instanceData.msg = 'Hi Bar!';
    this.instanceData.email = 'bar@foo.com';
    panel.innerHTML += this.receiveTPL(this.mutateOnReceive(this.instanceData));
    this.instanceData.msg = 'How are you';
    this.instanceData.email = clientEmail;
    panel.innerHTML += this.sendTPL(this.mutateBeforeSend(this.instanceData));
    this.instanceData.msg = 'doing okay!';
    this.instanceData.email = 'bar@foo.com';
    panel.innerHTML += this.receiveTPL(this.mutateOnReceive(this.instanceData));
    this.instanceData.msg = 'you?';
    panel.innerHTML += this.receiveTPL(this.mutateOnReceive(this.instanceData));
  }

}
