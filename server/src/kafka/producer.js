import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'bidify-server',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

export const initKafkaProducer = async () => {
  try {
    console.log('Connecting to Kafka...');
    await producer.connect();
    console.log('Connected to Kafka');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
    throw error;
  }
};

export const sendBidToKafka = async (bidData) => {
  if (!bidData.auctionId || !bidData.playerId || !bidData.teamId || !bidData.amount || !bidData.timestamp) {
    throw new Error('Invalid bid data');
  }
  try {
    await producer.send({
      topic: 'bids',
      messages: [{ value: JSON.stringify(bidData) }]
    });
    console.log(`Bid sent to Kafka: ${JSON.stringify(bidData)}`);
  } catch (error) {
    console.error('Error sending bid to Kafka:', error);
    throw error;
  }
};
