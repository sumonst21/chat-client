class ImapChat {
  /**
   * Class constructor.
   *
   * @param {object} instanceData
   * @param {string} messageContainerId
   * @param {string} inputId
   * @param {string} sendButtonId
   * @param {function} onLocalJoin
   * @param {function} onClientJoin
   * @param {function} sendTPL
   * @param {function} receiveTPL
   * @param {function} mutateBeforeSend
   * @param {function} mutateOnReceive
   */
  constructor(instanceData = null, messageContainerId = null, inputId = null, sendButtonId = null, onLocalJoin = null, onClientJoin = null, sendTPL = null, receiveTPL = null, mutateBeforeSend = null, mutateOnReceive = null) {
    this.instanceData       = instanceData;
    this.messageContainerId = messageContainerId;
    this.inputID            = inputId;
    this.sendButtonId       = sendButtonId;
    this.onLocalJoin        = onLocalJoin || (() => '');
    this.onClientJoin       = onClientJoin || (() => '');
    this.sendTPL            = sendTPL;
    this.receiveTPL         = receiveTPL;
    this.mutateBeforeSend   = mutateBeforeSend || (e => e);
    this.mutateOnReceive    = mutateOnReceive || (e => e);
    this.initIdentifier     = 'INITIAL_SOCK_INSTANCE';
  }

  /**
   * Sets initial object for current client
   * @Example {name: 'foo', email: 'foo@bar.com'}
   * @param {object} object
   */
  setInstanceData(object) {
    this.instanceData = object
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
   */
  run()
  {
    const panel = document.querySelector(this.messageContainerId);
    const input = document.querySelector(this.inputID);
    const send  = document.querySelector(this.sendButtonId);

    if (! panel)  {
      throw new Error(`Message Container. Couldn't find element with ID:"${this.messageContainerId}"`);
    }

    if (! this.onLocalJoin) {
      throw new Error('onJoin callback not specified.');
    }

    if (! this.sendTPL) {
      throw new Error('Sent message template callback not specified.');
    }

    if (! this.receiveTPL) {
      throw new Error('Received message template callback not specified.');
    }

    if (! input) {
      throw new Error(`Message Input. Couldn't find element with ID:"${this.inputID}"`);
    }

    const params = Object.assign({[this.initIdentifier]: true}, this.instanceData);
    const conn   = new WebSocket('ws://localhost:8080?' + JSON.stringify(params));

    conn.onmessage = e => {
      const data = JSON.parse(e.data);
      if (data[this.initIdentifier]) {
        panel.innerHTML += this.onClientJoin(data);
      } else {
        panel.innerHTML += this.receiveTPL(this.mutateOnReceive(data));
      }
    };

    if (! send) {
      throw new Error(`Send message button. Couldn't find element with ID:"${this.sendButtonId}"`);
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

}
