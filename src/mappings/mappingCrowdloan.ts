import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces";
import { CrowdloanMemoupdated } from "../types/models/CrowdloanMemoupdated";
import { CrowdloanContributed } from "../types/models/CrowdloanContributed";

export async function handleMemo(event: SubstrateEvent): Promise<void> {
  const { event: { data: [account_id_origin, para_id_origin, memo_origin] } } = event;
  const memo = memo_origin.toHuman().toString();
  const account_id = account_id_origin.toString();
  const para_id = para_id_origin.toString();
  const blockNumber = event.extrinsic.block.block.header.number.toNumber();
  const entity = new CrowdloanMemoupdated(blockNumber.toString() + '-' + event.idx.toString());
  entity.block_height = blockNumber;
  entity.event_id = event.idx;
  entity.extrinsic_id = event.extrinsic.idx;
  entity.block_timestamp = event.block.timestamp;
  entity.account = account_id;
  entity.para_id = para_id;
  entity.memo = memo;
  await entity.save();
}

export async function handleContributed(event: SubstrateEvent): Promise<void> {
  const { event: { data: [account_id_origin, para_id_origin, balance_origin] } } = event;
  const balance = balance_origin.toString();
  const account_id = account_id_origin.toString();
  const para_id = para_id_origin.toString();
  const blockNumber = event.extrinsic.block.block.header.number.toNumber();
  const entity = new CrowdloanContributed(blockNumber.toString() + '-' + event.idx.toString());
  entity.block_height = blockNumber;
  entity.event_id = event.idx;
  entity.extrinsic_id = event.extrinsic.idx;
  entity.block_timestamp = event.block.timestamp;
  entity.account = account_id;
  entity.para_id = para_id;
  entity.balance = balance;
  await entity.save();
}