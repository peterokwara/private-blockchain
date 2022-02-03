# Private Blockchain

This project is part of the Udacity Nanodegree Course. A proof of concept on how a Blockchain application can be implemented in his company.

## Getting Started

Ensure you have nodejs installed on your machine.

## Installation

Enter the main directory and run

```console
npm install
```

To install all the dependencies

## Run

Once the installation process has been done, to run the project, you can run:

```console
npm run start
```

To run on developer mode, you can simply run:

```console
npm run start-dev
```

Once the project is running, the API can be accessed from `localhost:8000` by default.

## Steps
1. The application will create a Genesis Block when we run the application.
2. The user will request the application to send a message to be signed using a Wallet and in this way verify the ownership over the    wallet address. The message format will be:
    ```
    <WALLET_ADRESS>:${new Date().getTime().toString().slice(0,-3)}:starRegistry;
    ```
3. Once the user has the message they can use a Wallet (Electrum or Bitcoin Core for example) to sign the message.
4. The user will try to submit the Star object for that. The submission will consist of: wallet address, message, signature and the star object with the star information. The Start information will be formed in this format:
    ```     
    "star": {
         "dec": "68° 52' 56.9",
         "ra": "16h 29m 1.0s",
         "story": "Testing the story 4"
     }
     ```
5. The application will verify if the time elapsed from the request ownership (the time is contained in the message) and the time when you submit the star is less than 5 minutes.
6. If everything is okay the star information will be stored in the block and added to the chain encoding the Star information.
The application will allow us to retrieve the Star objects belong to an owner (wallet address). This information should be human readable so it shouldn't be encoded.

## Contributing

To contribute code to this repository please read the [CONTRIBUTING](./CONTRIBUTING.md) guidelines.

## License

[MIT](./LICENSE)
