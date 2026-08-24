import { describe, it, expect } from "bun:test";
import { SegmentTree } from "../src/segment-tree";

describe("Segment tree performance characteristics", () => {
    it("should support many agents in the same range", () => {
        const tree = new SegmentTree(1440);

        for (let i = 0; i < 10_000; i++) {
            tree.addRange(
                540,
                1020,
                `agent-${i}`
            );
        }

        const agents = tree.query(720);

        expect(agents).toHaveLength(10_000);
    });

    it("should support long availability ranges", () => {
        const tree = new SegmentTree(1440);

        tree.addRange(0, 1440, "A");

        expect(tree.query(0)).toEqual(["A"]);
        expect(tree.query(720)).toEqual(["A"]);
        expect(tree.query(1439)).toEqual(["A"]);
    });

    it("should not return agents outside their range", () => {
        const tree = new SegmentTree(1440);

        tree.addRange(540, 600, "A");

        expect(tree.query(550)).toEqual(["A"]);
        expect(tree.query(600)).toEqual([]);
    });

    it("should handle many windows across many agents", () => {
        const tree = new SegmentTree(1440);

        for (let agent = 0; agent < 1000; agent++) {
            for (let window = 0; window < 10; window++) {
                const start = window * 120;
                const end = start + 60;

                tree.addRange(
                    start,
                    Math.min(end, 1440),
                    `agent-${agent}`
                );
            }
        }

        expect(tree.query(30)).toHaveLength(1000);
        expect(tree.query(150)).toHaveLength(1000);
    });

    it("should not duplicate an agent because of overlapping ranges", () => {
        const tree = new SegmentTree(1440);

        tree.addRange(100, 500, "A");
        tree.addRange(300, 700, "A");

        expect(tree.query(400)).toEqual(["A"]);
    });
});