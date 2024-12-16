import { votingQueue, votingQueueName } from "./jobs/VotingQueue.js";
import { commentQueue, commentQueueName } from "./jobs/CommentQueue.js";
export function setupSocket(io) {
    io.on("connection", (socket) => {
        console.log("A user connected");
        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
        // listen emit
        socket.onAny(async (eventName, data) => {
            if (eventName.startsWith("clashing-")) {
                await votingQueue.add(votingQueueName, data);
                socket.broadcast.emit(`clashing-${data?.clashId}`, data);
            }
            else if (eventName.startsWith("clashing_comment")) {
                await commentQueue.add(commentQueueName, data);
                socket.broadcast.emit(`clashing_comment-${data?.id}`, data);
            }
        });
    });
}
