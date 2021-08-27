import { SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { BlockNumber } from "@polkadot/types/interfaces";
import { EventId } from "@polkadot/types/interfaces/system";
import { Compact } from '@polkadot/types';
import { ParasumpInfo } from "../types/models/ParasumpInfo";
// import { CrowdloanMerged } from "../types/models/CrowdloanMerged";
import { SystemExtrinsicFailed } from "../types/models/SystemExtrinsicFailed";
import { CrowdloanContributed } from "../types/models/CrowdloanContributed";

const paraId = 2000;
const CrowdloanContributedEventId = '0x4901';
const ParasumpExecutedUpwardEventId = '0x3b02';
const ParasumpUpwardMessagesReceivedEventId = '0x3b04';

export async function parasUmp(block: SubstrateBlock): Promise<void> {
  const blockNumber = block.block.header.number.toNumber();
  // const upwardMessagesReceivedEvents = block.events.filter(e => e.event.section === 'parasUmp' && e.event.method === 'UpwardMessagesReceived' && JSON.parse(e.event.data.toString())[0] === paraId) as SubstrateEvent[];
  const upwardMessagesReceivedEvents = block.events.filter(e => e.event.section === 'parasUmp') as SubstrateEvent[];
  for (let upwardMessagesReceivedEvent of upwardMessagesReceivedEvents) {
    const { event: { data, section, method } } = upwardMessagesReceivedEvent;
    const record = new ParasumpInfo(blockNumber.toString() + '-' + upwardMessagesReceivedEvent.idx.toString());
    record.block_height = blockNumber;
    record.block_timestamp = block.timestamp;
    record.method = method.toString();
    record.data = data.toString();
    await record.save();
  }
  return;
}

export async function handleParasUmpUpwardMessagesReceived(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  if (JSON.parse(event.event.data.toString())[0] === paraId) {
    const crowdloanEvents = event.extrinsic.events.filter(e => (e.event.index as EventId).toString() == CrowdloanContributedEventId || (e.event.index as EventId).toString() == ParasumpExecutedUpwardEventId) as SubstrateEvent[];
    const len = crowdloanEvents.length;
    for (let i = 0; i < len; i++) {
      if ((crowdloanEvents[i].event.index as EventId).toString() == ParasumpExecutedUpwardEventId && i > 0) {
        if ((crowdloanEvents[i - 1].event.index as EventId).toString() == CrowdloanContributedEventId) {
          const record = new CrowdloanContributed(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
          record.block_height = blockNumber;
          record.event_id = crowdloanEvents[i].idx;
          record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
          record.block_timestamp = crowdloanEvents[i].block.timestamp;
          record.account = crowdloanEvents[i - 1].event.data[0].toString();
          record.para_id = crowdloanEvents[i - 1].event.data[1].toString();
          record.balance = crowdloanEvents[i - 1].event.data[2].toString();
          record.message_id = crowdloanEvents[i].event.data[0].toString();
          await record.save();
        } else {
          const record = new CrowdloanContributed(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
          record.block_height = blockNumber;
          record.event_id = crowdloanEvents[i].idx;
          record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
          record.block_timestamp = crowdloanEvents[i].block.timestamp;
          record.message_id = crowdloanEvents[i].event.data[0].toString();
          await record.save();
        }
      } else if ((crowdloanEvents[i].event.index as EventId).toString() == ParasumpExecutedUpwardEventId && i == 0) {
        const record = new CrowdloanContributed(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
        record.block_height = blockNumber;
        record.event_id = crowdloanEvents[i].idx;
        record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
        record.block_timestamp = crowdloanEvents[i].block.timestamp;
        record.message_id = crowdloanEvents[i].event.data[0].toString();
        await record.save();
        logger.info(`This ExecutedUpward event missing matching Contributed event: ${blockNumber}-${crowdloanEvents[i].idx}`)
      }
    }
  }
}

// export async function handleSystemExtrinsicFailed(event: SubstrateEvent): Promise<void> {
//   const blockNumber = event.block.block.header.number.toNumber();

//   const { event: { data } } = event;
//   const record = new SystemExtrinsicFailed(blockNumber.toString() + '-' + event.idx.toString());
//   record.block_height = blockNumber;
//   record.event_id = event.idx;
//   record.extrinsic_id = event.extrinsic.idx;
//   record.block_timestamp = event.block.timestamp;
//   record.data = data.toString();
//   await record.save();
// }
