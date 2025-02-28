// import {
// 	Amount,
// 	Currency,
// 	Operation,
// 	SIG_TYPE,
// 	TimeStamp,
// 	useId,
// 	useSigType,
// } from "mitum-sdk";

import { Mitum } from "../../mitumjs/cjs/index.js";
import { TimeStamp } from "../../mitumjs/cjs/utils/time.js";
import { Amount } from "../../mitumjs/cjs/types/property.js";
import { TransfersItem, TransfersFact } from "../../mitumjs/cjs/currency/transfer.js";
// import { Keys, PubKey } from "../../mitumjs/esm/account/publicKey.js"
import { OperationType } from "../../mitumjs/cjs/types/operation.js"

import { log, warning } from "../log.js";

import fs from "fs-extra";

const { ensureDirSync, readFileSync, writeFileSync } = fs;

async function run() {
	const argvs = process.argv.map((val) => val);
	const v = argvs[2];
	const id = argvs[3];
	const cid = argvs[4];
	const genesis = argvs[5];
	const n = parseInt(argvs[6]);
	const accs = argvs[7];
	const arg = {
		v,
		id,
		cid,
		genesis,
		n,
		accs,
	};
	// transfer(arg);
	transferM2(arg);
}

await run();

export function transfer({ v, id, cid, genesis, n, accs }) {
	const token = new Date().getTime();
	ensureDirSync(`logging/transfer-${token}/operations/`);
	log(`dir logging/transfer-${token}/operations/ created`);

	let accounts = [];
	try {
		accounts = [
			...JSON.parse(readFileSync(accs, { encoding: "utf8" }))["accounts"],
		];
		if (accounts.length < n) {
			throw new Error("insufficient accounts");
		}
		log(`get accounts...`);
	} catch (e) {
		warning(`insufficient accounts or wrong file path`);
		process.exit(-1);
	}

	useId(id);
	if (v === "v2") {
		useSigType(SIG_TYPE.M2);
	}

	log(
		`creating transfer operations in logging/transfer-${token}/operations/`
	);
	const transfers = [];
	for (let i = 0; i < n; i++) {
		const fact = new Currency.TransfersFact(
			new TimeStamp().UTC(),
			accounts[i].address,
			[new TransfersItem(genesis, [new Amount(cid, "1")])]
		);
		const op = new OperationType(id, fact);
		op.sign(accounts[i].private);
		transfers.push(op.toHintedObject());
	}

	transfers.forEach((op, idx) =>
		writeFileSync(
			`logging/transfer-${token}/operations/${idx}-${op.fact.hash}.json`,
			JSON.stringify(op, null, 4)
		)
	);
	log(`transfer files created in logging/transfer-${token}/operations/`);

	writeFileSync(
		`logging/transfer-${token}/files.csv`,
		transfers.map((op, idx) => `${idx}-${op.fact.hash}`).join("\n")
	);
	log(`logging/transfer-${token}/files.csv created`);
	writeFileSync(
		`logging/transfer-${token}/facts.csv`,
		transfers.map((op) => op.fact.hash).join("\n")
	);
	log(`logging/transfer-${token}/facts.csv created`);
}

export function transferM2({ v, id, cid, genesis, n, accs }) {
	const token = new Date().getTime();
	ensureDirSync(`logging/transfer-${token}/operations/`);
	log(`dir logging/transfer-${token}/operations/ created`);

	let accounts = [];
	try {
		accounts = [
			...JSON.parse(readFileSync(accs, { encoding: "utf8" }))["accounts"],
		];
		if (accounts.length < n) {
			throw new Error("insufficient accounts");
		}
		log(`get accounts...`);
	} catch (e) {
		warning(`insufficient accounts or wrong file path`);
		process.exit(-1);
	}

	// useId(id);
	// if (v === "v2") {
	// 	useSigType(SIG_TYPE.M2);
	// }
	const mitum = new Mitum();
	if (v === "v1") {
		console.error("v1 is unavailable with ../../mitumjs/");
		exit(-1);
	}

	log(
		`creating transfer operations in logging/transfer-${token}/operations/`
	);
	const transfers = [];
	for (let i = 0; i < n; i++) {
		const fact = new TransfersFact(
			new TimeStamp().UTC(),
			accounts[i].address,
			[new TransfersItem(genesis, [new Amount(cid, "1")])]
		);
		const op = new OperationType(id, fact);
		op.sign(accounts[i].private);
		transfers.push(op.toHintedObject());
	}

	transfers.forEach((op, idx) =>
		writeFileSync(
			`logging/transfer-${token}/operations/${idx}-${op.fact.hash}.json`,
			JSON.stringify(op, null, 4)
		)
	);
	log(`transfer files created in logging/transfer-${token}/operations/`);

	writeFileSync(
		`logging/transfer-${token}/files.csv`,
		transfers.map((op, idx) => `${idx}-${op.fact.hash}`).join("\n")
	);
	log(`logging/transfer-${token}/files.csv created`);
	writeFileSync(
		`logging/transfer-${token}/facts.csv`,
		transfers.map((op) => op.fact.hash).join("\n")
	);
	log(`logging/transfer-${token}/facts.csv created`);
}