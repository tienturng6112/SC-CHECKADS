/**
 * scoreCalculator.js
 * Chuẩn hóa công thức tính Tổng điểm (0-100) cho Creative Ads Check.
 * Áp dụng quy chuẩn: Không phạt chồng phạt (No Double Penalty).
 * Hỗ trợ cả Single Ad và Multi-Ad Comparison (vs-competitor).
 */

export function calculateStandardScore(evaluationData) {
  if (!evaluationData) {
    return {
      finalScore: 0,
      totalScore: 0,
      score: 0,
      baseScore: 0,
      penalty: 0,
      sumA: 0,
      sumB: 0,
      criticalCount: 0,
      statusLabel: 'Chưa chấm điểm',
      rating: 'Chưa chấm điểm',
      level: 'danger',
      badgeClass: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
      svgColor: '#64748b',
      textColor: 'text-slate-400',
      isGood: false,
      groupAScores: [],
      groupBScores: [],
    };
  }

  // Hỗ trợ chế độ so sánh: Nếu truyền vào kết quả so sánh, ưu tiên trích xuất từ myAdResult
  const target =
    evaluationData.myAdResult ||
    (Array.isArray(evaluationData.competitorResults) && evaluationData.competitorResults.length > 0
      ? evaluationData.competitorResults[0]
      : null) ||
    evaluationData;

  // 1. Trích xuất danh sách tiêu chí Nhóm A
  const rawListA =
    target.groupAResults ||
    target.groupA ||
    (Array.isArray(target.criteria)
      ? target.criteria.filter((c) => c.group === 'A' || c.id?.startsWith('A'))
      : []);

  // 2. Trích xuất danh sách tiêu chí Nhóm B
  const rawListB =
    target.groupBResults ||
    target.groupB ||
    (Array.isArray(target.criteria)
      ? target.criteria.filter((c) => c.group === 'B' || c.id?.startsWith('B'))
      : []);

  // Trích xuất điểm số (1-5) của từng tiêu chí
  const extractScore = (item) => {
    if (typeof item === 'number') return Math.max(1, Math.min(5, Math.round(item)));
    if (!item) return 3;
    const s = Number(item.score ?? item.point ?? 3);
    if (isNaN(s)) return 3;
    return Math.max(1, Math.min(5, Math.round(s)));
  };

  const hasSpecificScores = (Array.isArray(rawListA) && rawListA.length > 0) || (Array.isArray(rawListB) && rawListB.length > 0);

  // Nếu target đã có sẵn totalScore hợp lệ mà không có tiêu chí chi tiết, bảo tồn điểm đó
  if (!hasSpecificScores && typeof target.totalScore === 'number' && !isNaN(target.totalScore) && target.totalScore > 0) {
    const finalScore = target.totalScore;
    let statusLabel = target.statusLabel || (finalScore >= 80 ? 'Tốt' : finalScore >= 65 ? 'Khá' : 'Cần cải thiện');
    return {
      finalScore,
      totalScore: finalScore,
      score: finalScore,
      overallScore: finalScore,
      baseScore: finalScore,
      penalty: 0,
      sumA: 0,
      sumB: 0,
      criticalCount: 0,
      statusLabel,
      rating: statusLabel,
      status: statusLabel,
      level: finalScore >= 80 ? 'good' : finalScore >= 65 ? 'fair' : finalScore >= 50 ? 'warning' : 'danger',
      badgeClass: finalScore >= 80 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : finalScore >= 65 ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : finalScore >= 50 ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      svgColor: finalScore >= 80 ? '#22c55e' : finalScore >= 65 ? '#3b82f6' : finalScore >= 50 ? '#f59e0b' : '#ef4444',
      textColor: finalScore >= 80 ? 'text-emerald-400' : finalScore >= 65 ? 'text-blue-400' : finalScore >= 50 ? 'text-amber-400' : 'text-rose-400',
      isGood: finalScore >= 75,
      groupAScores: [],
      groupBScores: [],
    };
  }

  const groupAScores = Array.isArray(rawListA) && rawListA.length > 0
    ? rawListA.map(extractScore)
    : [3, 3, 3, 3, 3, 3, 3, 3, 3];

  const groupBScores = Array.isArray(rawListB) && rawListB.length > 0
    ? rawListB.map(extractScore)
    : [3, 3, 3, 3, 3, 3, 3, 3, 3];

  // Tính tổng điểm Nhóm A và Nhóm B
  const sumA = groupAScores.reduce((acc, curr) => acc + curr, 0);
  const sumB = groupBScores.reduce((acc, curr) => acc + curr, 0);

  const totalCriteriaCount = groupAScores.length + groupBScores.length;
  const maxPossiblePoints = totalCriteriaCount > 0 ? totalCriteriaCount * 5 : 90;

  // 3. Tính điểm phần trăm cơ sở (0-100)
  const baseScore = Math.round(((sumA + sumB) / maxPossiblePoints) * 100);

  // 4. Không phạt chồng phạt (No Double Penalty):
  // Chỉ phạt nhẹ khi có tiêu chí Nhóm A bị điểm liệt === 1
  const criticalCount = groupAScores.filter((s) => s === 1).length;
  const penalty = criticalCount * 3;

  // 5. Điểm số chuẩn hóa cuối cùng
  const finalScore = Math.max(0, Math.min(100, baseScore - penalty));

  // 6. Chuẩn hóa nhãn xếp loại & Màu sắc
  let statusLabel = 'Tốt';
  let level = 'good';
  let badgeClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  let svgColor = '#22c55e';
  let textColor = 'text-emerald-400';
  let isGood = true;

  if (finalScore >= 80) {
    statusLabel = 'Tốt';
    level = 'good';
    badgeClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
    svgColor = '#22c55e';
    textColor = 'text-emerald-400';
    isGood = true;
  } else if (finalScore >= 65) {
    statusLabel = 'Khá';
    level = 'fair';
    badgeClass = 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    svgColor = '#3b82f6';
    textColor = 'text-blue-400';
    isGood = true;
  } else if (finalScore >= 50) {
    statusLabel = 'Cần cải thiện';
    level = 'warning';
    badgeClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    svgColor = '#f59e0b';
    textColor = 'text-amber-400';
    isGood = false;
  } else {
    statusLabel = 'Rủi ro cao';
    level = 'danger';
    badgeClass = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
    svgColor = '#ef4444';
    textColor = 'text-rose-400';
    isGood = false;
  }

  return {
    finalScore,
    totalScore: finalScore,
    score: finalScore,
    overallScore: finalScore,
    baseScore,
    penalty,
    sumA,
    sumB,
    criticalCount,
    statusLabel,
    rating: statusLabel,
    status: statusLabel,
    level,
    badgeClass,
    svgColor,
    textColor,
    isGood,
    groupAScores,
    groupBScores,
  };
}

export default calculateStandardScore;
