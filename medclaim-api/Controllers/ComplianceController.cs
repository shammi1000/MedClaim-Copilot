using Microsoft.AspNetCore.Mvc;
using MedClaimCopilot.API.Models;

namespace MedClaimCopilot.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ComplianceController : ControllerBase
    {
        private static readonly Dictionary<string, string> _icdCodes = new()
        {
            ["M54.5"] = "Low Back Pain",
            ["J18.9"] = "Pneumonia, unspecified organism",
            ["I21.9"] = "Acute myocardial infarction, unspecified",
            ["E11.9"] = "Type 2 diabetes mellitus without complications",
            ["K35.80"] = "Other and unspecified acute appendicitis",
            ["S52.501A"] = "Fracture of unspecified part of radius",
            ["I10"] = "Essential (primary) hypertension",
            ["R51.9"] = "Headache, unspecified",
            ["J06.9"] = "Acute upper respiratory infection, unspecified"
        };

        /// <summary>Run compliance check on a claim</summary>
        [HttpPost("check")]
        [ProducesResponseType(typeof(ComplianceResult), StatusCodes.Status200OK)]
        public IActionResult CheckCompliance([FromBody] ComplianceCheckRequest request)
        {
            var issues = new List<ComplianceIssue>();
            double score = 100;

            // ICD-10 Validation
            bool icdValid = _icdCodes.ContainsKey(request.DiagnosisCode?.ToUpper() ?? "");
            if (!icdValid) { score -= 25; issues.Add(new ComplianceIssue { Severity = "high", Category = "ICD-10 Coding", Description = "Invalid or unrecognized ICD-10 diagnosis code.", Regulation = "HIPAA 5010 Standard", Recommendation = "Verify and enter a valid ICD-10 code from the current code set." }); }

            // Policy Number Check
            if (string.IsNullOrEmpty(request.PolicyNumber)) { score -= 20; issues.Add(new ComplianceIssue { Severity = "high", Category = "Policy Validation", Description = "Missing policy number. Cannot process claim.", Regulation = "CMS Claim Filing Requirements", Recommendation = "Obtain and verify policy number from insurance carrier." }); }

            // High-Value Claim
            if (request.ClaimAmount > 50000) { score -= 10; issues.Add(new ComplianceIssue { Severity = "medium", Category = "High-Value Claim", Description = $"Claim amount ${request.ClaimAmount:N0} exceeds $50,000 threshold.", Regulation = "ACA Section 2719", Recommendation = "Route to senior adjuster for additional review and approval." }); }

            // Document Check
            if (request.DocumentCount == 0) { score -= 15; issues.Add(new ComplianceIssue { Severity = "medium", Category = "Documentation", Description = "No supporting documents attached to the claim.", Regulation = "Medical Necessity Documentation Standards", Recommendation = "Attach medical records, invoices, and physician notes." }); }

            var status = score >= 80 ? "compliant" : score >= 60 ? "warning" : "violation";
            var recommendations = new List<string>();
            if (issues.Count == 0) recommendations.Add("All compliance checks passed. Claim is ready for processing.");
            recommendations.AddRange(issues.Select(i => i.Recommendation).Distinct());

            return Ok(new ComplianceResult
            {
                Score = Math.Max(0, score),
                Status = status,
                Issues = issues,
                Recommendations = recommendations,
                IcdCodeValid = icdValid,
                IcdCodeDescription = _icdCodes.TryGetValue(request.DiagnosisCode?.ToUpper() ?? "", out var desc) ? desc : "Unknown Code",
                CheckedAt = DateTime.UtcNow
            });
        }

        /// <summary>Validate an ICD-10 code</summary>
        [HttpGet("validate-icd/{code}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult ValidateIcd(string code)
        {
            var valid = _icdCodes.TryGetValue(code.ToUpper(), out var description);
            return Ok(new { valid, description = description ?? "Code not found in ICD-10 database", code = code.ToUpper() });
        }
    }
}
