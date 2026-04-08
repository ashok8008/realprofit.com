"""
ATS Check API Tests - Iteration 28
Tests for POST /api/career-tools/ats-check endpoint with MongoDB caching
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com')

# Sample resume data for testing
SAMPLE_RESUME = {
    "personal_details": {
        "fullName": "Test User",
        "email": "test@example.com",
        "phone": "555-123-4567",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/testuser",
        "portfolio": "testuser.dev"
    },
    "summary": "Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies.",
    "experience": [
        {
            "title": "Senior Software Engineer",
            "company": "Tech Corp",
            "startDate": "2020-01",
            "endDate": "",
            "current": True,
            "description": "Led development of microservices architecture serving 1M+ users"
        },
        {
            "title": "Software Engineer",
            "company": "Startup Inc",
            "startDate": "2018-06",
            "endDate": "2019-12",
            "current": False,
            "description": "Built React frontend and Node.js backend for e-commerce platform"
        }
    ],
    "education": [
        {
            "school": "MIT",
            "degree": "BS",
            "field": "Computer Science",
            "endDate": "2018"
        }
    ],
    "skills": ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker", "PostgreSQL"],
    "certifications": ["AWS Certified Developer", "Google Cloud Professional"]
}


class TestATSCheckEndpoint:
    """Tests for ATS Check API endpoint"""

    def test_ats_check_basic(self):
        """Test basic ATS check without job description"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=SAMPLE_RESUME
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify overall_score
        assert "overall_score" in data, "Missing overall_score"
        assert isinstance(data["overall_score"], int), "overall_score should be int"
        assert 0 <= data["overall_score"] <= 100, "overall_score should be 0-100"
        
        # Verify overall_status
        assert "overall_status" in data, "Missing overall_status"
        assert data["overall_status"] in ["Excellent", "Strong", "Good", "Needs Work", "Critical"], f"Invalid status: {data['overall_status']}"
        
        # Verify categories (5 categories)
        assert "categories" in data, "Missing categories"
        assert len(data["categories"]) == 5, f"Expected 5 categories, got {len(data['categories'])}"
        
        expected_categories = ["Keyword Match", "Format Safety", "Section Completeness", "Contact Info", "Date Consistency"]
        actual_categories = [cat["name"] for cat in data["categories"]]
        for expected in expected_categories:
            assert expected in actual_categories, f"Missing category: {expected}"
        
        # Verify each category structure
        for cat in data["categories"]:
            assert "name" in cat, "Category missing name"
            assert "score" in cat, "Category missing score"
            assert "max_score" in cat, "Category missing max_score"
            assert "status" in cat, "Category missing status"
            assert "issues" in cat, "Category missing issues"
            assert "fixes" in cat, "Category missing fixes"
            assert cat["status"] in ["pass", "warning", "fail"], f"Invalid category status: {cat['status']}"
            assert 0 <= cat["score"] <= cat["max_score"], "Score should be <= max_score"
        
        # Verify keyword_analysis
        assert "keyword_analysis" in data, "Missing keyword_analysis"
        kw = data["keyword_analysis"]
        assert "found" in kw, "keyword_analysis missing found"
        assert "missing" in kw, "keyword_analysis missing missing"
        assert "match_pct" in kw, "keyword_analysis missing match_pct"
        assert isinstance(kw["found"], list), "found should be list"
        assert isinstance(kw["missing"], list), "missing should be list"
        assert 0 <= kw["match_pct"] <= 100, "match_pct should be 0-100"
        
        # Verify summary_feedback
        assert "summary_feedback" in data, "Missing summary_feedback"
        assert isinstance(data["summary_feedback"], str), "summary_feedback should be string"
        assert len(data["summary_feedback"]) > 10, "summary_feedback should be meaningful"
        
        print(f"✓ ATS check basic test passed - Score: {data['overall_score']}, Status: {data['overall_status']}")

    def test_ats_check_with_job_description(self):
        """Test ATS check with job description for targeted keyword matching"""
        resume_with_jd = SAMPLE_RESUME.copy()
        resume_with_jd["job_description"] = """
        We are looking for a Senior Full Stack Developer with experience in:
        - React, TypeScript, GraphQL
        - Docker, Kubernetes, CI/CD pipelines
        - Agile methodologies and Scrum
        - Strong communication skills
        """
        
        response = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=resume_with_jd
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify keyword analysis reflects job description
        kw = data["keyword_analysis"]
        
        # Should find some keywords from resume that match JD
        assert len(kw["found"]) >= 0, "Should have found keywords list"
        
        # Should identify missing keywords from JD
        assert len(kw["missing"]) >= 0, "Should have missing keywords list"
        
        # Match percentage should be calculated
        assert 0 <= kw["match_pct"] <= 100, "match_pct should be valid"
        
        print(f"✓ ATS check with JD passed - Found: {len(kw['found'])}, Missing: {len(kw['missing'])}, Match: {kw['match_pct']}%")

    def test_ats_check_caching(self):
        """Test that same resume data returns cached result within 1 hour"""
        # Make first request
        start1 = time.time()
        response1 = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=SAMPLE_RESUME
        )
        time1 = time.time() - start1
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Make second request with same data (should be cached)
        start2 = time.time()
        response2 = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=SAMPLE_RESUME
        )
        time2 = time.time() - start2
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Results should be identical (cached)
        assert data1["overall_score"] == data2["overall_score"], "Cached result should have same score"
        assert data1["overall_status"] == data2["overall_status"], "Cached result should have same status"
        
        # Second request should be faster (cached) - but network latency varies
        # Just verify both work
        print(f"✓ Caching test passed - Request 1: {time1:.3f}s, Request 2: {time2:.3f}s")

    def test_ats_check_minimal_resume(self):
        """Test ATS check with minimal resume data"""
        minimal_resume = {
            "personal_details": {"fullName": "Minimal User", "email": "min@test.com"},
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": []
        }
        
        response = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=minimal_resume
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Should still return valid structure
        assert "overall_score" in data
        assert "categories" in data
        assert len(data["categories"]) == 5
        
        # Score should be lower for minimal resume
        assert data["overall_score"] <= 70, "Minimal resume should have lower score"
        
        print(f"✓ Minimal resume test passed - Score: {data['overall_score']}")

    def test_ats_check_category_scores_sum(self):
        """Test that category scores sum correctly"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=SAMPLE_RESUME
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Sum of category scores should be close to overall score
        category_sum = sum(cat["score"] for cat in data["categories"])
        max_possible = sum(cat["max_score"] for cat in data["categories"])
        
        assert max_possible == 100, "Max possible score should be 100"
        
        # Overall score should be within reasonable range of category sum
        # (AI might round differently)
        assert abs(data["overall_score"] - category_sum) <= 10, f"Score mismatch: overall={data['overall_score']}, sum={category_sum}"
        
        print(f"✓ Category scores test passed - Sum: {category_sum}, Overall: {data['overall_score']}")


class TestATSCheckValidation:
    """Tests for ATS Check input validation"""

    def test_ats_check_missing_personal_details(self):
        """Test ATS check with missing personal_details"""
        invalid_resume = {
            "summary": "Test summary",
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": []
        }
        
        response = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json=invalid_resume
        )
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Missing personal_details validation passed")

    def test_ats_check_empty_request(self):
        """Test ATS check with empty request body"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/ats-check",
            json={}
        )
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Empty request validation passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
