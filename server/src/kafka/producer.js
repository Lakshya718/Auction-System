import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
  clientId: "bidify-server",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
  },
});

// Flag to track producer connection status
let producerConnected = false;

// Add event listeners for connection status
producer.on("producer.connect", () => {
  console.log("Producer connected to Kafka");
  producerConnected = true;
});

producer.on("producer.disconnect", () => {
  console.log("Producer disconnected from Kafka");
  producerConnected = false;
});

// Function to ensure producer is connected
const ensureProducerConnected = async () => {
  if (!producerConnected) {
    console.log("Producer not connected, attempting to reconnect...");
    try {
      await producer.connect();
      producerConnected = true;
      console.log("Producer reconnected successfully");
    } catch (error) {
      console.error("Failed to reconnect producer:", error.message);
      throw new Error("Failed to connect to Kafka");
    }
  }
};

export const initKafkaProducer = async () => {
  try {
    console.log("Connecting to Kafka...");
    await producer.connect();
    producerConnected = true;
    console.log("Connected to Kafka");
  } catch (error) {
    console.error("Failed to connect to Kafka:", error);
    producerConnected = false;
    // Don't throw - allow app to start even if Kafka is not available initially
    console.warn(
      "App started without Kafka connection - will retry on first message send"
    );
  }
};

export const sendBidToKafka = async (bidData) => {
  if (
    !bidData.auctionId ||
    !bidData.playerId ||
    !bidData.teamId ||
    !bidData.amount ||
    !bidData.timestamp
  ) {
    throw new Error("Invalid bid data");
  }

  // Try to ensure producer is connected
  try {
    await ensureProducerConnected();
  } catch (connectionError) {
    console.error("Cannot reconnect to Kafka:", connectionError.message);
    // Still try to process the bid without Kafka
    console.log("Proceeding without Kafka, bid will be processed directly");
    // Return a resolved promise with dummy data to allow the operation to continue
    return {
      success: false,
      error: "Kafka unavailable",
      bid: bidData,
    };
  }

  try {
    const result = await producer.send({
      topic: "bids",
      messages: [{ value: JSON.stringify(bidData) }],
    });
    console.log(`Bid sent to Kafka: ${JSON.stringify(bidData)}`);
    return {
      success: true,
      result,
      bid: bidData,
    };
  } catch (error) {
    console.error("Error sending bid to Kafka:", error);
    // Return a resolved promise with error info to allow operation to continue
    return {
      success: false,
      error: error.message,
      bid: bidData,
    };
  }
};
