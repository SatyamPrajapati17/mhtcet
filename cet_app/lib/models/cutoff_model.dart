class Cutoff {
  final String collegeCode;
  final String branchCode;
  final int year;
  final int capRound;
  final String category;
  final double percentile;
  final int rank;

  const Cutoff({
    required this.collegeCode,
    required this.branchCode,
    required this.year,
    required this.capRound,
    required this.category,
    required this.percentile,
    required this.rank,
  });

  /// Parse from compact JSON array: [collegeCode, branchCode, year, capRound, category, percentile*100, rank]
  factory Cutoff.fromCompactArray(List<dynamic> arr) {
    return Cutoff(
      collegeCode: arr[0] as String,
      branchCode: arr[1] as String,
      year: arr[2] as int,
      capRound: arr[3] as int,
      category: arr[4] as String,
      percentile: (arr[5] as num).toDouble() / 100,
      rank: arr[6] as int,
    );
  }

  List<dynamic> toCompactArray() => [
        collegeCode,
        branchCode,
        year,
        capRound,
        category,
        (percentile * 100).round(),
        rank,
      ];
}
