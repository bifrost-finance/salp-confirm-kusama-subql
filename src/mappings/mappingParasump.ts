import { SubstrateBlock, SubstrateEvent } from "@subql/types";
import { BlockNumber } from "@polkadot/types/interfaces";
import { EventId } from "@polkadot/types/interfaces/system";
import { Compact } from '@polkadot/types';
import { ParasumpInfo } from "../types/models/ParasumpInfo";

const paraId = 3000;
const CrowdloanContributedEventId = '0x4901';

export async function parasUmp(block: SubstrateBlock): Promise<void> {
  const blockNumber = block.block.header.number.toNumber();

  const upwardMessagesReceivedEvents = block.events.filter(e => e.event.section === 'parasUmp' && e.event.method === 'UpwardMessagesReceived' && JSON.parse(e.event.data.toString())[0] == paraId) as SubstrateEvent[];
  for (let upwardMessagesReceivedEvent of upwardMessagesReceivedEvents) {
    const { extrinsic: { method: { args: a } } } = upwardMessagesReceivedEvent.extrinsic;
    logger.info(a.toString())
    logger.info(upwardMessagesReceivedEvent.extrinsic.events.toString())
    const crowdloanContributedEvents = upwardMessagesReceivedEvent.extrinsic.events.filter(e => (e.event.index as EventId).toString() == CrowdloanContributedEventId) as SubstrateEvent[];
    for (let crowdloanContributedEvent of crowdloanContributedEvents) {
    }
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

// [{
//     phase: {
//         applyExtrinsic: 1
//     },
//     event: {
//         index: '0x3b04',
//         data: [3000, 2, 48]
//     },
//     topics: []
// }, {
//     phase: {
//         applyExtrinsic: 1
//     },
//     event: {
//         index: '0x3501',
//         data: [{
//             descriptor: {
//                 paraId: 3000,
//                 relayParent: '0xcb6cf8223037b7dc3779a67fa37ffb778f7cbe7cee7614b888f2260d5c8731f4',
//                 collatorId: '0xd41fdf16c52514da372d43104db0c9193f67e8d2a2c048765496d7413c117b30',
//                 persistedValidationDataHash: '0x8407405396508353b92bff0122a93719dbb04294df6fe910441ccef12f6772cb',
//                 povHash: '0x0b126f1e447ea9cdae73ec8431cc47a9797abe0e1abd4ccce0d9b65d7f838d2b',
//                 erasureRoot: '0x369fd132d2e6186d296e95376e371eda8131791ad5557343fc1ad567bd4bb6e8',
//                 signature: '0x8a09d06a8e0adbf93ec345fe55f5c3322a6bbf620e6576f456a81eaa0bb49954dffb46f46b82f545fff92cad6857c6eb8dce6553ab6a1ff81ce0be6955ef0883',
//                 paraHead: '0x9def27bc1a2cf848280da1962cd9bb08bfcbcede7050b8c9f8b008fa03247843',
//                 validationCodeHash: '0x46ddbe42f2fad514e370220e3b0b98752feafb3d075b5d66cdac65344594c850'
//             },
//             commitmentsHash: '0x602ba27a6d1b5c48dc02eaceab297d9dee5e986e1c8ffa52014a61a3880d82fd'
//         }, '0xdc0204a99de2857b76b64e4f805a06a480c895e4dcb3e1182a0d31714cec1109806bc9416207eab5e23168f1063b7575d5ace43f4b661331f679a92b4df8095613162403608e447be0bda2644f19cad4268e492ed0d786e1a6cc1f844979a85911080661757261204df5170800000000056175726101016cddf197144a5cfaa97697b598200f4272ddb0ec9adbe4250b6c356390f167554cbc30c976074416db4f2316515be5a9af221dd15cb0782b1a6758dc3132ca8b', 0, 0]
//     },
//     topics: []
// }, {
//     phase: {
//         applyExtrinsic: 1
//     },
//     event: {
//         index: '0x3b02',
//         data: ['0x3d893470b15e8f31976f55ca73a112f8544874ccfc4219a8be2c25c061558d3d', {
//             complete: 2156495000
//         }]
//     },
//     topics: []
// }, {
//     phase: {
//         applyExtrinsic: 1
//     },
//     event: {
//         index: '0x3b02',
//         data: ['0x1c121470183119891e9ee43eb31c3d268dd54522f243000143e255e365eefc21', {
//             complete: 2156495000
//         }]
//     },
//     topics: []
// }, {
//     phase: {
//         applyExtrinsic: 1
//     },
//     event: {
//         index: '0x0000',
//         data: [{
//             weight: 250000000,
//             class: 'Mandatory',
//             paysFee: 'Yes'
//         }]
//     },
//     topics: []
// }]
