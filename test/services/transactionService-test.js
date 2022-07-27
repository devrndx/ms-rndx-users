const request = require("supertest");
const assert = require("chai").assert;
const sinon = require("sinon");
const fh = require("../support/fixture-helper.js");
const log = require("metalogger")();

const TransactionService = require("users/services/transactionService");

describe("transaction service test", () => {
  const infoService = new TransactionService();
  it("transaction serivce - CRUD test", async () => {
    const ExpectedAddress = "0x54c858B5E5c11A11095C74976E2A675734e7f9c6";
    const ExpectedAmount = "1000";
    const ExpectedFromAddr = "0x54c858B5E5c11A11095C74976E2A675734e7f9c6";
    const ExpectedToAddr = "0xfd6D98Be3Ac00C251Da66F9874D2cda378F5Cb8F";
    const ExpectedHash =
      "0x135c66c96618edaa5ed0021381c8e76fd4ebcd64b6d49fdb468b9e850ddd7998";
    const ExpectedTimestamp = 1646632630;
    const isSuccess = await infoService.createTxData(
      ExpectedAddress,
      ExpectedFromAddr,
      ExpectedToAddr,
      ExpectedAmount,
      ExpectedHash,
      ExpectedTimestamp
    );

    assert.equal(isSuccess, true, "Failed to create tx data");

    const txDatas = await infoService.getTxData(ExpectedAddress);

    assert.equal(
      txDatas[txDatas.length - 1]["sWalletAddress"],
      ExpectedAddress,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sWalletAddre"]}`
    );
    assert.equal(
      txDatas[txDatas.length - 1]["sFromAddress"],
      ExpectedFromAddr,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sFromAddress"]}`
    );
    assert.equal(
      txDatas[txDatas.length - 1]["sToAddr"],
      ExpectedToAddr,
      `Do not matched ${ExpectedToAddr} : ${txDatas[0]["sToAddr"]}`
    );
    assert.equal(
      txDatas[txDatas.length - 1]["nAmount"],
      ExpectedAmount,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["nAmount"]}`
    );
    assert.equal(
      txDatas[txDatas.length - 1]["sTxHash"],
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sTxHash"]}`
    );
    assert.equal(
      txDatas[txDatas.length - 1]["sTimeStamp"],
      ExpectedTimestamp,
      `Do not matched ${ExpectedTimestamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    await infoService.clearTxData(ExpectedAddress);
    const isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });

  it("transaction service - intialize txdata", async () => {
    const ExpectedAddress = "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d";
    const ExpectedAmount = "125000";
    const ExpectedFromAddr = "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d";
    const ExpectedToAddr = "0xfef53d325656d035042c72c2b60e322f923dbc62";
    const ExpectedTimeStamp = "1649007135";
    const ExpectedHash =
      "0xebf4f2ef3f1cb3a582feff009c42809a6179c939fe9b461d98ca50b11ed982d1";
    const strTestData = JSON.parse(`[
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436726,
          "transactionHash": "0xebf4f2ef3f1cb3a582feff009c42809a6179c939fe9b461d98ca50b11ed982d1",
          "typeInt": 48,
          "timestamp": 1649007135,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436487,
          "transactionHash": "0xaabc4efaf5c17d098efd3aa9958dc662e9656eea0a18c4c1661402c1e601e987",
          "typeInt": 48,
          "timestamp": 1649006896,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436315,
          "transactionHash": "0x6eb810373b755fd534676328d3842aeb3dc4bd4a4b7a58ffe6214b1aa3183c2e",
          "typeInt": 48,
          "timestamp": 1649006724,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87435767,
          "transactionHash": "0xc56ea318e29819d8e6226b19c1f5c13ebef37333a6e57c639c65ca4de03d6ab2",
          "typeInt": 48,
          "timestamp": 1649006176,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87435435,
          "transactionHash": "0xa88e51215669a7f9b0039c20fef8b5e2fc2e7897bc14af0139ee0404a804fe05",
          "typeInt": 48,
          "timestamp": 1649005844,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0xa0b6cfd3b45000",
          "blockNumber": 87434536,
          "transactionHash": "0x63d9a19bc29d70232962652d4c50c3144a18b29e09b6e21d2d7703732ad02917",
          "typeInt": 48,
          "timestamp": 1649004945,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      }
    ]`);
    await infoService.clearTxData(ExpectedAddress);

    let isExists = await infoService.isExists(ExpectedAddress);
    if (!isExists) {
      assert.equal(isExists, false, "Remain elements");
      await infoService.createInitialDatas(ExpectedAddress, strTestData);
    }

    const txDatas = await infoService.getTxData(ExpectedAddress);
    assert.equal(
      txDatas[0]["sWalletAddress"],
      ExpectedAddress.toLowerCase(),
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sWalletAddress"]}`
    );
    assert.equal(
      txDatas[0]["sFromAddress"],
      ExpectedFromAddr.toLowerCase(),
      `Do not matched ${ExpectedFromAddr} : ${txDatas[0]["sFromAddress"]}`
    );
    assert.equal(
      txDatas[0]["sToAddr"],
      ExpectedToAddr.toLowerCase(),
      `Do not matched ${ExpectedToAddr} : ${txDatas[0]["sToAddr"]}`
    );
    assert.equal(
      txDatas[0]["nAmount"],
      ExpectedAmount,
      `Do not matched ${ExpectedAmount} : ${txDatas[0]["nAmount"]}`
    );
    assert.equal(
      txDatas[0]["sTxHash"],
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sTxHash"]}`
    );
    assert.equal(
      txDatas[0]["sTimeStamp"],
      ExpectedTimeStamp,
      `Do not matched ${ExpectedTimeStamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    const formattedValue = await infoService.getFormmatedTxData(
      ExpectedAddress
    );

    assert.equal(
      formattedValue[0].address,
      ExpectedAddress,
      `Do not matched ${ExpectedAddress} : ${formattedValue[0].address}`
    );
    assert.equal(
      formattedValue[0].fromAddr,
      ExpectedAddress,
      `Do not matched ${ExpectedAddress} : ${formattedValue[0].fromAddr}`
    );
    assert.equal(
      formattedValue[0].toAddr,
      ExpectedToAddr,
      `Do not matched ${ExpectedToAddr} : ${formattedValue[0].toAddr}`
    );
    assert.equal(
      formattedValue[0].amount,
      ExpectedAmount,
      `Do not matched ${ExpectedAmount} : ${formattedValue[0].amount}`
    );
    assert.equal(
      formattedValue[0].txHash,
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${formattedValue[0].txHash}`
    );
    assert.equal(
      formattedValue[0].timeStamp,
      '1649007135',
      `Do not matched ${ExpectedTimeStamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    await infoService.clearTxData(ExpectedAddress);
    isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });

  it("transaction service - Insert txdata", async () => {
    const ExpectedAddress = "0xfef53d325656d035042c72c2b60e322f923dbc62";
    const ExpectedAmount = "125000";
    const ExpectedFromAddr = "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d";
    const ExpectedToAddr = "0xfef53d325656d035042c72c2b60e322f923dbc62";
    const ExpectedTimeStamp = "1646632630";
    const ExpectedHash =
      "0xebf4f2ef3f1cb3a582feff009c42809a6179c939fe9b461d98ca50b11ed982d1";

    const ExpectedLastAddress = "0xfef53d325656d035042c72c2b60e322f923dbc62";
    const ExpectedLastAmount = "125000";
    const ExpectedLastFromAddr = "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d";
    const ExpectedLastToAddr = "0xfef53d325656d035042c72c2b60e322f923dbc62";
    const ExpectedLastTimeStamp = "1649007298";
    const ExpectedLastHash =
      "0xe68d642ca5c0023aae5569f80648c85e21648502fe66b35454a40a032178e828";

    const firstTestData = JSON.parse(`[
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436726,
          "transactionHash": "0xebf4f2ef3f1cb3a582feff009c42809a6179c939fe9b461d98ca50b11ed982d1",
          "typeInt": 48,
          "timestamp": 1649007135,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436487,
          "transactionHash": "0xaabc4efaf5c17d098efd3aa9958dc662e9656eea0a18c4c1661402c1e601e987",
          "typeInt": 48,
          "timestamp": 1649006896,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436315,
          "transactionHash": "0x6eb810373b755fd534676328d3842aeb3dc4bd4a4b7a58ffe6214b1aa3183c2e",
          "typeInt": 48,
          "timestamp": 1649006724,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87435767,
          "transactionHash": "0xc56ea318e29819d8e6226b19c1f5c13ebef37333a6e57c639c65ca4de03d6ab2",
          "typeInt": 48,
          "timestamp": 1649006176,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87435435,
          "transactionHash": "0xa88e51215669a7f9b0039c20fef8b5e2fc2e7897bc14af0139ee0404a804fe05",
          "typeInt": 48,
          "timestamp": 1649005844,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0xa0b6cfd3b45000",
          "blockNumber": 87434536,
          "transactionHash": "0x63d9a19bc29d70232962652d4c50c3144a18b29e09b6e21d2d7703732ad02917",
          "typeInt": 48,
          "timestamp": 1649004945,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      }
    ]`);

    const secondTestData = JSON.parse(`[
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87437016,
          "transactionHash": "0x6a231abbb89a5b711a97c8a938613384c133e57e1b0bc20d38ad5d503955af1b",
          "typeInt": 48,
          "timestamp": 1649007425,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436889,
          "transactionHash": "0xe68d642ca5c0023aae5569f80648c85e21648502fe66b35454a40a032178e828",
          "typeInt": 48,
          "timestamp": 1649007298,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436726,
          "transactionHash": "0xebf4f2ef3f1cb3a582feff009c42809a6179c939fe9b461d98ca50b11ed982d1",
          "typeInt": 48,
          "timestamp": 1649007135,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436487,
          "transactionHash": "0xaabc4efaf5c17d098efd3aa9958dc662e9656eea0a18c4c1661402c1e601e987",
          "typeInt": 48,
          "timestamp": 1649006896,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87436315,
          "transactionHash": "0x6eb810373b755fd534676328d3842aeb3dc4bd4a4b7a58ffe6214b1aa3183c2e",
          "typeInt": 48,
          "timestamp": 1649006724,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87435767,
          "transactionHash": "0xc56ea318e29819d8e6226b19c1f5c13ebef37333a6e57c639c65ca4de03d6ab2",
          "typeInt": 48,
          "timestamp": 1649006176,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0x78beff15fb3000",
          "blockNumber": 87435435,
          "transactionHash": "0xa88e51215669a7f9b0039c20fef8b5e2fc2e7897bc14af0139ee0404a804fe05",
          "typeInt": 48,
          "timestamp": 1649005844,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      },
      {
        "transferType": "ft",
        "transaction": {
          "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
          "fee": "0xa0b6cfd3b45000",
          "blockNumber": 87434536,
          "transactionHash": "0x63d9a19bc29d70232962652d4c50c3144a18b29e09b6e21d2d7703732ad02917",
          "typeInt": 48,
          "timestamp": 1649004945,
          "value": "0x0",
          "feePayer": "",
          "feeRatio": 0
        },
        "contract": {
          "address": "0x8a0ad7b5d5fc3aff47b0016b83830a81f9b84a6e",
          "name": "Round X",
          "symbol": "RNDX",
          "decimals": 18
        },
        "from": "0x119a593af04a29ed65aa334c1deb8ed5ad188e2d",
        "to": "0xfef53d325656d035042c72c2b60e322f923dbc62",
        "value": "0x1a784379d99db4200000",
        "formattedValue": "125000"
      }
    ]`);
    await infoService.clearTxData(ExpectedAddress);

    let isExists = await infoService.isExists(ExpectedAddress);
    if (!isExists) {
      assert.equal(isExists, false, "Remain elements");
      await infoService.createInitialDatas(ExpectedAddress, firstTestData);
    }

    const txDatas = await infoService.getTxData(ExpectedAddress);
    assert.equal(
      txDatas[0]["sWalletAddress"],
      ExpectedAddress.toLowerCase(),
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sWalletAddress"]}`
    );
    assert.equal(
      txDatas[0]["sFromAddress"],
      ExpectedFromAddr.toLowerCase(),
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sFromAddress"]}`
    );
    assert.equal(
      txDatas[0]["sToAddr"],
      ExpectedToAddr.toLowerCase(),
      `Do not matched ${ExpectedToAddr} : ${txDatas[0]["sToAddr"]}`
    );
    assert.equal(
      txDatas[0]["nAmount"],
      ExpectedAmount,
      `Do not matched ${ExpectedAmount} : ${txDatas[0]["nAmount"]}`
    );
    assert.equal(
      txDatas[0]["sTxHash"],
      ExpectedHash,
      `Do not matched ${ExpectedAddress} : ${txDatas[0]["sTxHash"]}`
    );
    assert.equal(
      txDatas[0]["sTimeStamp"],
      "1649007135",
      `Do not matched ${ExpectedTimeStamp} : ${txDatas[0]["sTimeStamp"]}`
    );

    await infoService.insertTransferData(ExpectedAddress, secondTestData);
    const txSecDatas = await infoService.getTxData(ExpectedAddress);

    assert.equal(
        txSecDatas[txSecDatas.length - 1]["sWalletAddress"],
        ExpectedLastAddress.toLowerCase(),
        `Do not matched ${ExpectedAddress} : ${txSecDatas[txSecDatas.length - 1]["sWalletAddress"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sFromAddress"],
        ExpectedLastFromAddr.toLowerCase(),
        `Do not matched ${ExpectedAddress} : ${txSecDatas[txSecDatas.length - 1]["sFromAddress"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sToAddr"],
        ExpectedLastToAddr.toLowerCase(),
        `Do not matched ${ExpectedToAddr} : ${txSecDatas[txSecDatas.length - 1]["sToAddr"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["nAmount"],
        ExpectedLastAmount,
        `Do not matched ${ExpectedAmount} : ${txSecDatas[txSecDatas.length - 1]["nAmount"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sTxHash"],
        ExpectedLastHash,
        `Do not matched ${ExpectedAddress} : ${txSecDatas[txSecDatas.length - 1]["sTxHash"]}`
      );
      assert.equal(
        txSecDatas[txSecDatas.length - 1]["sTimeStamp"],
        ExpectedLastTimeStamp,
        `Do not matched ${ExpectedTimeStamp} : ${txSecDatas[txSecDatas.length - 1]["sTimeStamp"]}`
      );

    await infoService.clearTxData(ExpectedAddress);
    isExists = await infoService.isExists(ExpectedAddress);

    assert.equal(isExists, false);
  });
});
