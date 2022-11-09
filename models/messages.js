const messages = [];

const getMessageList = () => {
    return messages;
}

const addMessage = (message) => {
    messages.push(message);
}

export {
    getMessageList,
    addMessage
}