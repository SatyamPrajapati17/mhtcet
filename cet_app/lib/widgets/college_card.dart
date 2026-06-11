import 'package:flutter/material.dart';
import '../models/college_model.dart';
import '../utils/app_theme.dart';

/// Reusable college card widget matching the web doppel-bezel design
class CollegeCard extends StatelessWidget {
  final College college;
  final int? cutoffCount;
  final VoidCallback? onTap;

  const CollegeCard({
    super.key,
    required this.college,
    this.cutoffCount,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: AppTheme.doppelOuter(),
        child: Container(
          decoration: AppTheme.doppelInner(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      college.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.nut900,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.cream100,
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: AppTheme.cream300),
                    ),
                    child: Text(
                      college.code,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.nut500,
                      ),
                    ),
                  ),
                ],
              ),
              if (college.city.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.nut400),
                    const SizedBox(width: 4),
                    Text(
                      college.city,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.nut400,
                      ),
                    ),
                  ],
                ),
              ],
              if (cutoffCount != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.school_outlined, size: 14, color: AppTheme.nut400),
                    const SizedBox(width: 4),
                    Text(
                      '$cutoffCount cutoff records',
                      style: const TextStyle(fontSize: 12, color: AppTheme.nut400),
                    ),
                    const Spacer(),
                    const Icon(
                      Icons.arrow_forward_ios,
                      size: 12,
                      color: AppTheme.nut300,
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
