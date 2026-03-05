export function getHallDisplayName(h) {
  return `${h.name} — Room ${h.roomNo}`;
}

export function allocateSeats(students, halls) {
  const allocations = [];
  const activeBranches = [...new Set(students.map(s => s.branch))];
  const byBranch = {};
  activeBranches.forEach(b => { byBranch[b] = students.filter(s => s.branch === b); });

  const interleaved = [];
  const cursors = {};
  activeBranches.forEach(b => { cursors[b] = 0; });
  let round = 0;
  while (interleaved.length < students.length) {
    const branch = activeBranches[round % activeBranches.length];
    if (cursors[branch] < byBranch[branch].length) {
      interleaved.push(byBranch[branch][cursors[branch]++]);
    }
    round++;
    if (round > students.length * Math.max(activeBranches.length, 1) + 10) break;
  }

  const getValidBenchPositions = (hall) => {
    const missing = new Set(hall.missingBenches || []);
    const positions = [];
    for (let r = 1; r <= hall.rows; r++) {
      for (let c = 1; c <= hall.cols; c++) {
        if (!missing.has(`${r}-${c}`)) positions.push({ row: r, col: c });
      }
    }
    return positions;
  };

  let hallIdx = 0;
  let hallPositions = halls.length > 0 ? getValidBenchPositions(halls[0]) : [];
  let posIdx = 0;
  let slotInBench = 0;
  let seatNumber = 1;

  for (const student of interleaved) {
    while (hallIdx < halls.length) {
      const hall = halls[hallIdx];
      const spotsPerBench = hall.benchType === "double" ? 2 : 1;
      const totalSpots = hallPositions.length * spotsPerBench;
      const usedSpots = (posIdx * spotsPerBench) + slotInBench;
      if (usedSpots < totalSpots) break;
      hallIdx++;
      if (hallIdx < halls.length) {
        hallPositions = getValidBenchPositions(halls[hallIdx]);
        posIdx = 0; slotInBench = 0; seatNumber = 1;
      }
    }
    if (hallIdx >= halls.length) break;

    const hall = halls[hallIdx];
    const spotsPerBench = hall.benchType === "double" ? 2 : 1;
    const { row, col } = hallPositions[posIdx];

    allocations.push({
      studentId: student.id, rollNo: student.rollNo, name: student.name,
      branch: student.branch, year: student.year,
      hallId: hall.id, hallName: getHallDisplayName(hall),
      seatNumber, row, col, slot: slotInBench,
      benchType: hall.benchType
    });
    seatNumber++;

    slotInBench++;
    if (slotInBench >= spotsPerBench) { slotInBench = 0; posIdx++; }
  }

  return allocations;
}
