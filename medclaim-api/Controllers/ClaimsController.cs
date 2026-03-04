using Microsoft.AspNetCore.Mvc;
using MedClaimCopilot.API.Models;

namespace MedClaimCopilot.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ClaimsController : ControllerBase
    {
        private static readonly List<Claim> _claims = new()
        {
            new Claim { Id = "CLM-2024-001", PatientName = "James Anderson", InsuranceId = "INS-78453", PolicyNumber = "POL-2024-112", DiagnosisCode = "M54.5", DiagnosisDescription = "Low Back Pain", HospitalName = "City General Hospital", ClaimAmount = 4250.00m, Status = ClaimStatus.Approved, SubmittedDate = DateTime.Parse("2024-11-18") },
            new Claim { Id = "CLM-2024-002", PatientName = "Maria Rodriguez", InsuranceId = "INS-91234", PolicyNumber = "POL-2024-089", DiagnosisCode = "J18.9", DiagnosisDescription = "Pneumonia", HospitalName = "St. Mary Medical Center", ClaimAmount = 12800.00m, Status = ClaimStatus.InReview, SubmittedDate = DateTime.Parse("2024-11-22") },
            new Claim { Id = "CLM-2024-003", PatientName = "Robert Chen", InsuranceId = "INS-55678", PolicyNumber = "POL-2024-201", DiagnosisCode = "I21.9", DiagnosisDescription = "Acute Myocardial Infarction", HospitalName = "Heart & Vascular Institute", ClaimAmount = 85000.00m, Status = ClaimStatus.Pending, SubmittedDate = DateTime.Parse("2024-11-25") },
            new Claim { Id = "CLM-2024-004", PatientName = "Emily Thompson", InsuranceId = "INS-33892", PolicyNumber = "POL-2024-055", DiagnosisCode = "S52.501A", DiagnosisDescription = "Fracture of Radius", HospitalName = "Orthopedic Specialists Clinic", ClaimAmount = 6750.00m, Status = ClaimStatus.Rejected, SubmittedDate = DateTime.Parse("2024-11-08"), AdjusterNotes = "Policy does not cover out-of-network providers." },
            new Claim { Id = "CLM-2024-005", PatientName = "David Wilson", InsuranceId = "INS-62145", PolicyNumber = "POL-2024-178", DiagnosisCode = "E11.9", DiagnosisDescription = "Type 2 Diabetes", HospitalName = "Metro Diabetes Care Center", ClaimAmount = 3200.00m, Status = ClaimStatus.Pending, SubmittedDate = DateTime.Parse("2024-11-29") }
        };

        /// <summary>Get all claims with optional filtering</summary>
        [HttpGet]
        [ProducesResponseType(typeof(List<Claim>), StatusCodes.Status200OK)]
        public IActionResult GetAll([FromQuery] string? status, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _claims.AsEnumerable();
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<ClaimStatus>(status, out var s))
                query = query.Where(c => c.Status == s);
            if (!string.IsNullOrEmpty(search))
                query = query.Where(c => c.Id.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                         c.PatientName.Contains(search, StringComparison.OrdinalIgnoreCase));
            var result = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return Ok(new { total = _claims.Count, page, pageSize, data = result });
        }

        /// <summary>Get a single claim by ID</summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Claim), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetById(string id)
        {
            var claim = _claims.FirstOrDefault(c => c.Id == id);
            if (claim == null) return NotFound(new { message = $"Claim {id} not found." });
            return Ok(claim);
        }

        /// <summary>Submit a new insurance claim</summary>
        [HttpPost]
        [ProducesResponseType(typeof(Claim), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Create([FromBody] Claim claim)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            claim.Id = $"CLM-{DateTime.Now.Year}-{(_claims.Count + 1):D3}";
            claim.SubmittedDate = DateTime.UtcNow;
            claim.Status = ClaimStatus.Pending;
            claim.Timeline.Add(new TimelineEvent { Event = "Claim Submitted", Date = DateTime.UtcNow, Description = "Claim submitted successfully.", Status = "completed", Actor = "Portal User" });
            _claims.Add(claim);
            return CreatedAtAction(nameof(GetById), new { id = claim.Id }, claim);
        }

        /// <summary>Update claim status</summary>
        [HttpPatch("{id}/status")]
        [ProducesResponseType(typeof(Claim), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult UpdateStatus(string id, [FromBody] UpdateStatusRequest req)
        {
            var claim = _claims.FirstOrDefault(c => c.Id == id);
            if (claim == null) return NotFound();
            claim.Status = req.Status;
            if (!string.IsNullOrEmpty(req.Notes)) claim.AdjusterNotes = req.Notes;
            claim.Timeline.Add(new TimelineEvent { Event = $"Status Updated to {req.Status}", Date = DateTime.UtcNow, Description = req.Notes ?? "", Status = "completed", Actor = "Adjuster" });
            return Ok(claim);
        }

        /// <summary>Delete a claim</summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public IActionResult Delete(string id)
        {
            var claim = _claims.FirstOrDefault(c => c.Id == id);
            if (claim == null) return NotFound();
            _claims.Remove(claim);
            return NoContent();
        }

        /// <summary>Get claim statistics</summary>
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            return Ok(new
            {
                total = _claims.Count,
                pending = _claims.Count(c => c.Status == ClaimStatus.Pending),
                approved = _claims.Count(c => c.Status == ClaimStatus.Approved),
                rejected = _claims.Count(c => c.Status == ClaimStatus.Rejected),
                inReview = _claims.Count(c => c.Status == ClaimStatus.InReview),
                totalAmount = _claims.Sum(c => c.ClaimAmount)
            });
        }
    }

    public class UpdateStatusRequest
    {
        public ClaimStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
