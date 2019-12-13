import Web3 from "web3";
import Notify from "bnc-notify";

import "./styles.css";

const sendHashButton = document.getElementById("sendHash");
sendHashButton.onclick = postFlightNotifications;

const sendTransactionButton = document.getElementById("sendTransaction");
sendTransactionButton.onclick = preAndPostFlightNotifications;

const customNotificationButton = document.getElementById("customNotification");
customNotificationButton.onclick = customNotification;

// initialize the notify library
const notify = Notify({
  dappId: "12153f55-f29e-4f11-aa07-90f10da5d778",
  networkId: 4
});

const provider = window.ethereum;
const web3 = new Web3(provider);

async function postFlightNotifications() {
  const accounts = await getAccounts();
  const address = accounts[0];

  const txDetails = {
    from: address,
    to: "0x792ec62e6840bFcCEa00c669521F678CE1236705",
    value: "1000000"
  };

  const hash = await sendTransaction(txDetails);

  const { emitter } = notify.hash(hash);

  emitter.on("txPool", transaction => {
    console.log(transaction);

    // uncomment one of the return statements below to customize the notification for this event

    // return {
    //   // type: 'hint', // change the type(style) of the notification
    //   // autoDismiss: 2000, // make the notification autodismiss after 2 secs
    //   // onclick: () => console.log('the notification has been clicked!'), // add a click handler to the notification
    //   message: 'this is a custom message for a pending transaction'
    // }

    // return false if you don't want a notification to be shown for this event
    // return false

    // do nothing or return undefined for the default notification
    // return undefined
  });

  emitter.on("txConfirmed", transaction => console.log(transaction));

  emitter.on("all", transaction => {
    // 'all' handler gets called for every transaction event that you haven't registered a handler for
    console.log(transaction);
  });
}

async function preAndPostFlightNotifications() {
  const accounts = await getAccounts();
  const address = accounts[0];
  const balance = await getBalance(address);

  const txDetails = {
    from: address,
    to: "0x792ec62e6840bFcCEa00c669521F678CE1236705",
    value: "1000000"
  };

  const estimateGas = () =>
    web3.eth.estimateGas(txDetails).then(res => res.toString());

  const emitter = notify.transaction({
    sendTransaction: () => sendTransaction(txDetails),
    gasPrice: getGasPrice,
    estimateGas,
    balance,
    txDetails
  });

  emitter.on("txRequest", console.log);
  emitter.on("nsfFail", console.log);
  emitter.on("txRepeat", console.log);
  emitter.on("txAwaitingApproval", console.log);
  emitter.on("txConfirmReminder", console.log);
  emitter.on("txSendFail", console.log);
  emitter.on("txError", console.log);
  emitter.on("txUnderPriced", console.log);
  emitter.on("txSent", console.log);
  emitter.on("txPool", console.log);
  emitter.on("txConfirmed", console.log);
  emitter.on("txSpeedUp", console.log);
  emitter.on("txCancel", console.log);
  emitter.on("txFailed", console.log);
}

function customNotification() {
  const { update, dismiss } = notify.notification({
    eventCode: "dbUpdate",
    type: "pending",
    message: "Your custom message goes here...."
  });

  // update after some time has passed
  setTimeout(
    () =>
      update({
        eventCode: "dbUpdateSuccess",
        message: "Your updated status message goes here",
        type: "success"
      }),
    4000
  );
}

function sendTransaction(txDetails) {
  return new Promise(async (resolve, reject) => {
    const promiEvent = web3.eth.sendTransaction(txDetails);

    promiEvent.catch(reject);
    promiEvent.on("transactionHash", resolve);
  });
}

function getAccounts() {
  return window.ethereum.enable();
}

function getBalance(address) {
  return web3.eth.getBalance(address);
}

function getGasPrice() {
  return web3.eth.getGasPrice();
}
