class College {
  final String code;
  final String name;
  final String city;

  const College({
    required this.code,
    required this.name,
    this.city = '',
  });

  factory College.fromJson(Map<String, dynamic> json) {
    return College(
      code: json['c'] as String,
      name: json['n'] as String,
      city: (json['t'] as String?) ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'c': code, 'n': name, 't': city};

  String get displayCity => city.isNotEmpty ? city : 'N/A';
}

class Branch {
  final String code;
  final String name;

  const Branch({required this.code, required this.name});

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      code: json['c'] as String,
      name: json['n'] as String,
    );
  }

  Map<String, dynamic> toJson() => {'c': code, 'n': name};
}
