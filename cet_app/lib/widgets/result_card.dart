import 'package:flutter/material.dart';
import '../models/prediction_model.dart';
import '../utils/app_theme.dart';

/// Widget to display a single prediction result row
class ResultCard extends StatelessWidget {
  final PredictionResult result;
  final VoidCallback? onTap;

  const ResultCard({
    super.key,
    required this.result,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final level = result.level;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.transparent,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    result.collegeName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.nut900,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    result.branchName,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.nut400,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${result.closingPercentile.toStringAsFixed(2)}%',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.nut900,
                  ),
                ),
                Text(
                  'Closing',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppTheme.nut400,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: level.badgeBg,
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: level.badgeBorder),
              ),
              child: Text(
                result.levelLabel,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: level.badgeColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
