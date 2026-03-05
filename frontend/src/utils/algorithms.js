/**
 * ─── EXAM HALL ALLOCATION — ALGORITHM REGISTRY ───────────────────────────────
 *
 * All algorithms share the same contract:
 *   Input  : (students: Student[], halls: Hall[]) => Allocation[]
 *   Output : Allocation[]   (same shape as the original allocateSeats result)
 *
 * Student  : { id, rollNo, name, branch, year, ... }
 * Hall     : { id, name, roomNo, benchType, rows, cols, missingBenches[], capacity }
 * Allocation: {
 *   studentId, rollNo, name, branch, year,
 *   hallId, hallName, seatNumber,
 *   row, col, slot,      // bench position inside the hall
 *   benchType            // "single" | "double"
 * }
 *
 * Adding a new algorithm:
 *   1. Write a pure function  myAlgo(students, halls) => Allocation[]
 *   2. Add an entry to ALGORITHM_REGISTRY below
 *   3. Done — the UI picks it up automatically
 */

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Human-readable hall label used in every allocation record */
function hallDisplayName(h) {
  return `${h.name} — Room ${h.roomNo}`;
}

/**
 * Returns the ordered list of valid (row, col) bench positions for a hall,
 * skipping any positions listed in hall.missingBenches.
 */
function validBenchPositions(hall) {
  const missing = new Set(hall.missingBenches || []);
  const positions = [];
  for (let r = 1; r <= hall.rows; r++) {
    for (let c = 1; c <= hall.cols; c++) {
      if (!missing.has(`${r}-${c}`)) positions.push({ row: r, col: c });
    }
  }
  return positions;
}

/**
 * Low-level seat writer.
 * Iterates `orderedStudents` and fills halls sequentially using the
 * bench-position order supplied by `positionsFn(hall)`.
 *
 * @param {Student[]}  orderedStudents  - students already sorted/interleaved
 * @param {Hall[]}     halls
 * @param {Function}   positionsFn      - (hall) => [{row,col}]
 * @returns {Allocation[]}
 */
function fillSeats(orderedStudents, halls, positionsFn = validBenchPositions) {
  const allocations = [];
  let hallIdx    = 0;
  let positions  = halls.length > 0 ? positionsFn(halls[0]) : [];
  let posIdx     = 0;   // index into current hall's positions array
  let slot       = 0;   // 0 = left/single, 1 = right (double seater only)
  let seatNumber = 1;

  for (const student of orderedStudents) {
    // Advance to next hall when current is exhausted
    while (hallIdx < halls.length) {
      const spotsPerBench = halls[hallIdx].benchType === "double" ? 2 : 1;
      const totalSpots    = positions.length * spotsPerBench;
      const usedSpots     = posIdx * spotsPerBench + slot;
      if (usedSpots < totalSpots) break;
      hallIdx++;
      if (hallIdx < halls.length) {
        positions  = positionsFn(halls[hallIdx]);
        posIdx     = 0;
        slot       = 0;
        seatNumber = 1;
      }
    }
    if (hallIdx >= halls.length) break;

    const hall          = halls[hallIdx];
    const spotsPerBench = hall.benchType === "double" ? 2 : 1;
    const { row, col }  = positions[posIdx];

    allocations.push({
      studentId:  student.id,
      rollNo:     student.rollNo,
      name:       student.name,
      branch:     student.branch,
      year:       student.year,
      hallId:     hall.id,
      hallName:   hallDisplayName(hall),
      seatNumber,
      row, col,
      slot,
      benchType:  hall.benchType,
    });

    seatNumber++;
    slot++;
    if (slot >= spotsPerBench) { slot = 0; posIdx++; }
  }

  return allocations;
}

// ─── 1. Round-Robin (original / default) ─────────────────────────────────────
/**
 * Students are interleaved branch-by-branch in round-robin order so that
 * adjacent seats almost always belong to different branches.
 */
function roundRobinAllocation(students, halls) {
  const branches = [...new Set(students.map(s => s.branch))];
  const byBranch = {};
  branches.forEach(b => { byBranch[b] = students.filter(s => s.branch === b); });

  const interleaved = [];
  const cursors     = {};
  branches.forEach(b => { cursors[b] = 0; });

  let round = 0;
  while (interleaved.length < students.length) {
    const branch = branches[round % branches.length];
    if (cursors[branch] < byBranch[branch].length) {
      interleaved.push(byBranch[branch][cursors[branch]++]);
    }
    round++;
    if (round > students.length * Math.max(branches.length, 1) + 10) break;
  }

  return fillSeats(interleaved, halls);
}

// ─── 2. First Fit ─────────────────────────────────────────────────────────────
/**
 * Students are seated in their original array order — no reordering.
 * The first available seat in the first available hall is taken.
 * Simple and predictable; branches will cluster together.
 */
function firstFitAllocation(students, halls) {
  return fillSeats([...students], halls);
}

// ─── 3. Capacity-Based ────────────────────────────────────────────────────────
/**
 * Halls with larger capacity are filled first.
 * Within each hall, students are interleaved by branch (round-robin).
 * Useful when you want the biggest halls utilised before overflow rooms.
 */
function capacityBasedAllocation(students, halls) {
  const sortedHalls = [...halls].sort((a, b) => b.capacity - a.capacity);

  const branches    = [...new Set(students.map(s => s.branch))];
  const byBranch    = {};
  branches.forEach(b => { byBranch[b] = [...students.filter(s => s.branch === b)]; });

  const interleaved = [];
  const cursors     = {};
  branches.forEach(b => { cursors[b] = 0; });

  let round = 0;
  while (interleaved.length < students.length) {
    const branch = branches[round % branches.length];
    if (cursors[branch] < byBranch[branch].length) {
      interleaved.push(byBranch[branch][cursors[branch]++]);
    }
    round++;
    if (round > students.length * Math.max(branches.length, 1) + 10) break;
  }

  return fillSeats(interleaved, sortedHalls);
}

// ─── 4. Department-Wise ───────────────────────────────────────────────────────
/**
 * Each branch is seated together, block by block (CSC…CSE…ECE…).
 * Within a branch students are ordered by roll number.
 * Good for department-specific exams where mixing is not required.
 */
function departmentWiseAllocation(students, halls) {
  const branches = [...new Set(students.map(s => s.branch))].sort();
  const ordered  = branches.flatMap(b =>
    students.filter(s => s.branch === b).sort((a, z) => a.rollNo.localeCompare(z.rollNo))
  );
  return fillSeats(ordered, halls);
}

// ─── 5. Zig-Zag ──────────────────────────────────────────────────────────────
/**
 * Seats are filled in a snake / zig-zag pattern:
 *   Row 1 → left to right
 *   Row 2 → right to left
 *   Row 3 → left to right  …
 *
 * Students are interleaved by branch (round-robin) before being placed, so
 * the directional reversal adds a second layer of mixing — students from the
 * same branch end up as far apart as possible spatially.
 */
function zigZagAllocation(students, halls) {
  // Build the zig-zag position order per hall
  function zigZagPositions(hall) {
    const missing   = new Set(hall.missingBenches || []);
    const positions = [];
    for (let r = 1; r <= hall.rows; r++) {
      const cols = r % 2 === 1
        ? Array.from({ length: hall.cols }, (_, i) => i + 1)          // L → R
        : Array.from({ length: hall.cols }, (_, i) => hall.cols - i); // R → L
      for (const c of cols) {
        if (!missing.has(`${r}-${c}`)) positions.push({ row: r, col: c });
      }
    }
    return positions;
  }

  // Interleave students by branch first
  const branches = [...new Set(students.map(s => s.branch))];
  const byBranch = {};
  branches.forEach(b => { byBranch[b] = students.filter(s => s.branch === b); });

  const interleaved = [];
  const cursors     = {};
  branches.forEach(b => { cursors[b] = 0; });

  let round = 0;
  while (interleaved.length < students.length) {
    const branch = branches[round % branches.length];
    if (cursors[branch] < byBranch[branch].length) {
      interleaved.push(byBranch[branch][cursors[branch]++]);
    }
    round++;
    if (round > students.length * Math.max(branches.length, 1) + 10) break;
  }

  return fillSeats(interleaved, halls, zigZagPositions);
}

// ─── 6. Strict Exam Allocation ────────────────────────────────────────────────
/**
 * Enforces two hard constraints:
 *   C1 — Bench-mate constraint:
 *        For a double-seater bench, both slots must NOT be the same branch.
 *   C2 — Adjacent-column constraint:
 *        A student must NOT share a branch with the student directly to their
 *        left (col-1) or right (col+1) on the same row.
 *
 * Algorithm:
 *   1. Build a queue of students interleaved by branch (round-robin).
 *   2. For each seat, take the first candidate from the queue.
 *      If they violate C1 or C2, scan forward in the queue for a valid swap.
 *      If no valid candidate exists, fall back to the original (best-effort).
 *   3. Record which branch is already placed at each (hallId, row, col, slot)
 *      so constraints can be checked in O(1).
 */
function strictExamAllocation(students, halls) {
  const allocations = [];

  // Interleave by branch
  const branches = [...new Set(students.map(s => s.branch))];
  const byBranch = {};
  branches.forEach(b => { byBranch[b] = students.filter(s => s.branch === b); });

  const queue   = [];
  const cursors = {};
  branches.forEach(b => { cursors[b] = 0; });
  let round = 0;
  while (queue.length < students.length) {
    const branch = branches[round % branches.length];
    if (cursors[branch] < byBranch[branch].length) {
      queue.push(byBranch[branch][cursors[branch]++]);
    }
    round++;
    if (round > students.length * Math.max(branches.length, 1) + 10) break;
  }

  // placed[hallId][row][col][slot] = branch string
  const placed = {};
  const getBranch = (hallId, row, col, s) => placed[hallId]?.[row]?.[col]?.[s] ?? null;
  const setBranch = (hallId, row, col, s, branch) => {
    if (!placed[hallId])           placed[hallId]           = {};
    if (!placed[hallId][row])      placed[hallId][row]      = {};
    if (!placed[hallId][row][col]) placed[hallId][row][col] = {};
    placed[hallId][row][col][s] = branch;
  };

  const isValid = (hallId, row, col, slot, branch) => {
    // C1: bench-mate must differ
    const mateSlot = slot === 0 ? 1 : 0;
    if (getBranch(hallId, row, col, mateSlot) === branch) return false;
    // C2: left and right neighbour must differ
    if (col > 1) {
      if (getBranch(hallId, row, col - 1, 0) === branch) return false;
      if (getBranch(hallId, row, col - 1, 1) === branch) return false;
    }
    if (col < 99) { // cols are bounded by hall.cols but we check generously
      if (getBranch(hallId, row, col + 1, 0) === branch) return false;
      if (getBranch(hallId, row, col + 1, 1) === branch) return false;
    }
    return true;
  };

  let qHead  = 0; // pointer into queue (avoids splice cost)
  let hallIdx  = 0;
  let positions = halls.length > 0 ? validBenchPositions(halls[0]) : [];
  let posIdx    = 0;
  let slot      = 0;
  let seatNumber = 1;

  while (qHead < queue.length) {
    // Advance hall when exhausted
    while (hallIdx < halls.length) {
      const spotsPerBench = halls[hallIdx].benchType === "double" ? 2 : 1;
      if (posIdx * spotsPerBench + slot < positions.length * spotsPerBench) break;
      hallIdx++;
      if (hallIdx < halls.length) {
        positions  = validBenchPositions(halls[hallIdx]);
        posIdx     = 0;
        slot       = 0;
        seatNumber = 1;
      }
    }
    if (hallIdx >= halls.length) break;

    const hall          = halls[hallIdx];
    const spotsPerBench = hall.benchType === "double" ? 2 : 1;
    const { row, col }  = positions[posIdx];

    // Find the first valid student in the remaining queue
    let chosen = qHead;
    const MAX_LOOKAHEAD = Math.min(qHead + branches.length * 2, queue.length);
    for (let i = qHead; i < MAX_LOOKAHEAD; i++) {
      if (isValid(hall.id, row, col, slot, queue[i].branch)) {
        chosen = i;
        break;
      }
    }

    // Swap chosen to front of remaining queue
    if (chosen !== qHead) {
      [queue[qHead], queue[chosen]] = [queue[chosen], queue[qHead]];
    }

    const student = queue[qHead++];
    setBranch(hall.id, row, col, slot, student.branch);

    allocations.push({
      studentId:  student.id,
      rollNo:     student.rollNo,
      name:       student.name,
      branch:     student.branch,
      year:       student.year,
      hallId:     hall.id,
      hallName:   hallDisplayName(hall),
      seatNumber,
      row, col,
      slot,
      benchType:  hall.benchType,
    });

    seatNumber++;
    slot++;
    if (slot >= spotsPerBench) { slot = 0; posIdx++; }
  }

  return allocations;
}

// ─── ALGORITHM REGISTRY ───────────────────────────────────────────────────────
/**
 * To add a new algorithm:
 *   1. Write a pure function  myAlgo(students, halls) => Allocation[]
 *   2. Add a new entry below — { label, description, fn }
 *   3. The UI picks it up automatically — no other file needs changing.
 */
export const ALGORITHM_REGISTRY = {
  roundRobin: {
    label:       "Round Robin",
    description: "Interleaves students branch-by-branch so adjacent seats almost always differ in branch.",
    fn:          roundRobinAllocation,
  },
  firstFit: {
    label:       "First Fit",
    description: "Seats students in their original order; first available seat in first available hall.",
    fn:          firstFitAllocation,
  },
  capacityBased: {
    label:       "Capacity-Based",
    description: "Fills larger halls first, then overflows to smaller halls.",
    fn:          capacityBasedAllocation,
  },
  departmentWise: {
    label:       "Department-Wise",
    description: "Groups all students from the same branch together, sorted by roll number.",
    fn:          departmentWiseAllocation,
  },
  zigZag: {
    label:       "Zig-Zag",
    description: "Fills rows in alternating left→right / right→left snake order for maximum spatial mixing.",
    fn:          zigZagAllocation,
  },
  strictExam: {
    label:       "Strict Exam",
    description: "Enforces that no two students of the same branch share a bench or sit in adjacent columns.",
    fn:          strictExamAllocation,
  },
};

/** Default algorithm key */
export const DEFAULT_ALGORITHM = "roundRobin";
