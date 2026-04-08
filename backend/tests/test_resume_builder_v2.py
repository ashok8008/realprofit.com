"""
Resume Builder API Tests - v2 (UX/UI Overhaul)
Tests for the new generate-summaries endpoint and existing career-tools APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGenerateSummariesAPI:
    """Tests for POST /api/career-tools/generate-summaries endpoint"""
    
    def test_generate_summaries_returns_3_options(self):
        """Test that generate-summaries returns exactly 3 summary options"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/generate-summaries",
            json={
                "job_title": "Software Engineer",
                "skills": ["Python", "React", "AWS"],
                "industry": "Technology"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "summaries" in data, "Response should contain 'summaries' key"
        assert isinstance(data["summaries"], list), "Summaries should be a list"
        assert len(data["summaries"]) == 3, f"Expected 3 summaries, got {len(data['summaries'])}"
        
        # Verify each summary is a non-empty string
        for i, summary in enumerate(data["summaries"]):
            assert isinstance(summary, str), f"Summary {i} should be a string"
            assert len(summary) > 20, f"Summary {i} should be at least 20 chars"
    
    def test_generate_summaries_with_minimal_input(self):
        """Test generate-summaries with minimal input (no job_title, skills, industry)"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/generate-summaries",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "summaries" in data
        assert len(data["summaries"]) == 3
    
    def test_generate_summaries_with_years_experience(self):
        """Test generate-summaries with years_experience parameter"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/generate-summaries",
            json={
                "job_title": "Product Manager",
                "years_experience": 5,
                "skills": ["Agile", "Roadmapping", "User Research"],
                "industry": "Technology"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["summaries"]) == 3


class TestExistingCareerToolsAPIs:
    """Tests for existing career-tools endpoints to ensure no regression"""
    
    def test_improve_bullet_endpoint(self):
        """Test POST /api/career-tools/improve-bullet"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": "Worked on software projects",
                "job_title": "Software Engineer"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "original" in data
        assert "improved" in data
        assert "suggestions" in data
        assert data["original"] == "Worked on software projects"
    
    def test_improve_summary_endpoint(self):
        """Test POST /api/career-tools/improve-summary"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={
                "current_summary": "I am a software engineer with experience.",
                "job_title": "Software Engineer",
                "skills": ["Python", "JavaScript"]
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "original" in data
        assert "improved" in data
        assert "word_count" in data


class TestSuggestSkillsAPI:
    """Tests for POST /api/career-tools/suggest-skills endpoint"""
    
    def test_suggest_skills_returns_suggestions(self):
        """Test that suggest-skills returns skill suggestions for a job title"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/suggest-skills",
            json={
                "job_title": "Software Engineer",
                "current_skills": ["Python", "JavaScript"]
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "suggestions" in data, "Response should contain 'suggestions' key"
        assert isinstance(data["suggestions"], list), "Suggestions should be a list"
        assert len(data["suggestions"]) > 0, "Should return at least one suggestion"
        assert len(data["suggestions"]) <= 15, "Should return at most 15 suggestions"
        
        # Verify suggestions don't include current skills
        for skill in data["suggestions"]:
            assert skill.lower() not in ["python", "javascript"], f"Should not suggest already-owned skill: {skill}"
    
    def test_suggest_skills_without_current_skills(self):
        """Test suggest-skills without current_skills parameter"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/suggest-skills",
            json={
                "job_title": "Data Scientist"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) > 0
    
    def test_suggest_skills_different_job_titles(self):
        """Test suggest-skills returns different skills for different job titles"""
        # Get skills for Software Engineer
        response1 = requests.post(
            f"{BASE_URL}/api/career-tools/suggest-skills",
            json={"job_title": "Software Engineer"},
            headers={"Content-Type": "application/json"}
        )
        
        # Get skills for Marketing Manager
        response2 = requests.post(
            f"{BASE_URL}/api/career-tools/suggest-skills",
            json={"job_title": "Marketing Manager"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        skills1 = set(response1.json()["suggestions"])
        skills2 = set(response2.json()["suggestions"])
        
        # Skills should be different for different job titles
        # At least some skills should be unique to each
        assert skills1 != skills2, "Different job titles should have different skill suggestions"


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test GET /api/health"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
