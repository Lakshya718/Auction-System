import { initKafkaProducer, sendBidToKafka } from './producer.js';

const testSendBid = async () => {
  try {
    await initKafkaProducer();
    await sendBidToKafka({
      auctionId: '60d21b4667d0d8992e610c85',
      playerId: '60d21b4967d0d8992e610c86',
      teamId: '60d21b4a67d0d8992e610c87',
      amount: 12845679,
      timestamp: Date.now()
    });
    console.log('Test bid sent successfully');
  } catch (error) {
    console.error('Error sending test bid:', error);
  } finally {
    process.exit(0);
  }
};

testSendBid();
