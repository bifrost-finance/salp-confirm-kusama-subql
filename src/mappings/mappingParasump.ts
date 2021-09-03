import { SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { BlockNumber } from "@polkadot/types/interfaces";
import { EventId } from "@polkadot/types/interfaces/system";
import { Compact } from '@polkadot/types';
import { ParasumpInfo } from "../types/models/ParasumpInfo";
import { CrowdloanContributed } from "../types/models/CrowdloanContributed";
import { CrowdloanContributedSecondCheck } from "../types/models/CrowdloanContributedSecondCheck";

const paraId = 2001;
const CrowdloanContributedEventId = '0x4901';
const ParasumpInvalidFormatEventId = '0x3b00';
const ParasumpUnsupportedVersionEventId = '0x3b01';
const ParasumpExecutedUpwardEventId = '0x3b02';
const ParasumpWeightExhaustedEventId = '0x3b03';
const ParasumpUpwardMessagesReceivedEventId = '0x3b04';

export async function parasUmp(block: SubstrateBlock): Promise<void> {
  const blockNumber = block.block.header.number.toNumber();
  // const upwardMessagesReceivedEvents = block.events.filter(e => e.event.section === 'ump' && e.event.method === 'UpwardMessagesReceived' && JSON.parse(e.event.data.toString())[0] === paraId) as SubstrateEvent[];
  const upwardMessagesReceivedEvents = block.events.filter(e => e.event.section === 'ump') as SubstrateEvent[];
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
    const crowdloanEvents = event.extrinsic.events.filter(
      e =>
        (e.event.index as EventId).toString() == CrowdloanContributedEventId
        || (e.event.index as EventId).toString() == ParasumpExecutedUpwardEventId
        || (e.event.index as EventId).toString() == ParasumpWeightExhaustedEventId
        || (e.event.index as EventId).toString() == ParasumpInvalidFormatEventId
        || (e.event.index as EventId).toString() == ParasumpUnsupportedVersionEventId
    ) as SubstrateEvent[];
    let promises_array = []
    crowdloanEvents.forEach((item, i, crowdloanEvents) => {
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
          promises_array.push(record.save());
        } else {
          const record = new CrowdloanContributed(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
          record.block_height = blockNumber;
          record.event_id = crowdloanEvents[i].idx;
          record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
          record.block_timestamp = crowdloanEvents[i].block.timestamp;
          record.message_id = crowdloanEvents[i].event.data[0].toString();
          promises_array.push(record.save());
        }
      } else if ((crowdloanEvents[i].event.index as EventId).toString() == ParasumpExecutedUpwardEventId && i == 0) {
        const record = new CrowdloanContributed(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
        record.block_height = blockNumber;
        record.event_id = crowdloanEvents[i].idx;
        record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
        record.block_timestamp = crowdloanEvents[i].block.timestamp;
        record.message_id = crowdloanEvents[i].event.data[0].toString();
        promises_array.push(record.save());
        logger.info(`This ExecutedUpward event missing matching Contributed event: ${blockNumber}-${crowdloanEvents[i].idx}`)
      }
      if ((crowdloanEvents[i].event.index as EventId).toString() == ParasumpWeightExhaustedEventId
        || (crowdloanEvents[i].event.index as EventId).toString() == ParasumpInvalidFormatEventId
        || (crowdloanEvents[i].event.index as EventId).toString() == ParasumpUnsupportedVersionEventId) {
        // logger.info(JSON.stringify(crowdloanEvents[i].idx))
        // logger.info(JSON.stringify(crowdloanEvents[i]))
        const record = new CrowdloanContributed(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
        record.block_height = blockNumber;
        record.event_id = crowdloanEvents[i].idx;
        record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
        record.block_timestamp = crowdloanEvents[i].block.timestamp;
        record.message_id = crowdloanEvents[i].event.data[0].toString();
        promises_array.push(record.save());
      }
    })
    await Promise.all(promises_array);
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

export async function handleUmpExecutedUpward(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const ParasumpUpwardMessagesReceivedEvent = event.extrinsic.events.find(e => (e.event.index as EventId).toString() == ParasumpUpwardMessagesReceivedEventId) as SubstrateEvent;
  if (ParasumpUpwardMessagesReceivedEvent == undefined) {
    let promises_array = [];
    const crowdloanEvents = event.extrinsic.events.filter(
      e =>
        (e.event.index as EventId).toString() == CrowdloanContributedEventId
        || (e.event.index as EventId).toString() == ParasumpExecutedUpwardEventId
      // || (e.event.index as EventId).toString() == ParasumpWeightExhaustedEventId
      // || (e.event.index as EventId).toString() == ParasumpInvalidFormatEventId
      // || (e.event.index as EventId).toString() == ParasumpUnsupportedVersionEventId
    ) as SubstrateEvent[];
    crowdloanEvents.forEach((item, i, crowdloanEvents) => {
      if ((crowdloanEvents[i].event.index as EventId).toString() == ParasumpExecutedUpwardEventId && i > 0) {
        if ((crowdloanEvents[i - 1].event.index as EventId).toString() == CrowdloanContributedEventId) {
          const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
          record.block_height = blockNumber;
          record.event_id = crowdloanEvents[i].idx;
          record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
          record.block_timestamp = crowdloanEvents[i].block.timestamp;
          record.account = crowdloanEvents[i - 1].event.data[0].toString();
          record.para_id = crowdloanEvents[i - 1].event.data[1].toString();
          record.balance = crowdloanEvents[i - 1].event.data[2].toString();
          record.message_id = crowdloanEvents[i].event.data[0].toString();
          promises_array.push(record.save());
        } else {
          const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
          record.block_height = blockNumber;
          record.event_id = crowdloanEvents[i].idx;
          record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
          record.block_timestamp = crowdloanEvents[i].block.timestamp;
          record.message_id = crowdloanEvents[i].event.data[0].toString();
          promises_array.push(record.save());
        }
      } else if ((crowdloanEvents[i].event.index as EventId).toString() == ParasumpExecutedUpwardEventId && i == 0) {
        const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
        record.block_height = blockNumber;
        record.event_id = crowdloanEvents[i].idx;
        record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
        record.block_timestamp = crowdloanEvents[i].block.timestamp;
        record.message_id = crowdloanEvents[i].event.data[0].toString();
        promises_array.push(record.save());
        logger.info(`This ExecutedUpward event missing matching Contributed event: ${blockNumber}-${crowdloanEvents[i].idx}`)
      }
    })
    await Promise.all(promises_array);
  }
}


export async function handleUmpWeightExhausted(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const ParasumpUpwardMessagesReceivedEvent = event.extrinsic.events.find(e => (e.event.index as EventId).toString() == ParasumpUpwardMessagesReceivedEventId) as SubstrateEvent;
  if (ParasumpUpwardMessagesReceivedEvent == undefined) {
    const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic.idx;
    record.block_timestamp = event.block.timestamp;
    record.message_id = event.event.data[0].toString();
    await record.save();
  }
}


export async function handleUmpInvalidFormat(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const ParasumpUpwardMessagesReceivedEvent = event.extrinsic.events.find(e => (e.event.index as EventId).toString() == ParasumpUpwardMessagesReceivedEventId) as SubstrateEvent;
  if (ParasumpUpwardMessagesReceivedEvent == undefined) {
    const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic.idx;
    record.block_timestamp = event.block.timestamp;
    record.message_id = event.event.data[0].toString();
    await record.save();
    // let promises_array = [];
    // const crowdloanEvents = event.extrinsic.events.filter(
    //   e =>
    //     (e.event.index as EventId).toString() == ParasumpInvalidFormatEventId
    // ) as SubstrateEvent[];
    // crowdloanEvents.forEach((item, i, crowdloanEvents) => {
    //   const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + crowdloanEvents[i].idx.toString());
    //   record.block_height = blockNumber;
    //   record.event_id = crowdloanEvents[i].idx;
    //   record.extrinsic_id = crowdloanEvents[i].extrinsic.idx;
    //   record.block_timestamp = crowdloanEvents[i].block.timestamp;
    //   record.message_id = crowdloanEvents[i].event.data[0].toString();
    //   promises_array.push(record.save());
    // })
    // await Promise.all(promises_array);
  }
}



export async function handleUmpUnsupportedVersion(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const ParasumpUpwardMessagesReceivedEvent = event.extrinsic.events.find(e => (e.event.index as EventId).toString() == ParasumpUpwardMessagesReceivedEventId) as SubstrateEvent;
  if (ParasumpUpwardMessagesReceivedEvent == undefined) {
    const record = new CrowdloanContributedSecondCheck(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic.idx;
    record.block_timestamp = event.block.timestamp;
    record.message_id = event.event.data[0].toString();
    await record.save();
  }
}