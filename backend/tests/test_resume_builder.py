"""
Resume Builder API Tests
Tests for /api/career-tools/improve-bullet and /api/career-tools/improve-summary endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test that the API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("SUCCESS: Health endpoint returns healthy status")


class TestImproveBulletEndpoint:
    """Tests for /api/career-tools/improve-bullet endpoint"""
    
    def test_improve_bullet_basic(self):
        """Test basic bullet point improvement"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": "Worked on customer projects",
                "job_title": "Software Engineer"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "original" in data
        assert "improved" in data
        assert "suggestions" in data
        
        # Verify original is preserved
        assert data["original"] == "Worked on customer projects"
        
        # Verify improved is different and not empty
        assert len(data["improved"]) > 0
        assert data["improved"] != data["original"]
        
        # Verify suggestions is a list
        assert isinstance(data["suggestions"], list)
        
        print(f"SUCCESS: Bullet improved from '{data['original']}' to '{data['improved']}'")
    
    def test_improve_bullet_without_job_title(self):
        """Test bullet improvement without job title"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": "Managed team tasks"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved" in data
        assert len(data["improved"]) > 0
        print("SUCCESS: Bullet improved without job title")
    
    def test_improve_bullet_with_context(self):
        """Test bullet improvement with context"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": "Helped with code reviews",
                "job_title": "Senior Developer",
                "context": "Tech startup"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved" in data
        print("SUCCESS: Bullet improved with context")
    
    def test_improve_bullet_empty_returns_error(self):
        """Test that empty bullet point is handled"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": ""
            }
        )
        # Should still return 200 but with minimal improvement
        assert response.status_code == 200
        print("SUCCESS: Empty bullet point handled gracefully")
    
    def test_improve_bullet_missing_field(self):
        """Test that missing bullet_point field returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={}
        )
        assert response.status_code == 422
        print("SUCCESS: Missing field returns 422 validation error")


class TestImproveSummaryEndpoint:
    """Tests for /api/career-tools/improve-summary endpoint"""
    
    def test_improve_summary_basic(self):
        """Test basic summary improvement"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={
                "current_summary": "I am a software engineer with experience in web development",
                "job_title": "Software Engineer",
                "skills": ["React", "Node.js", "Python"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "original" in data
        assert "improved" in data
        assert "word_count" in data
        
        # Verify original is preserved
        assert data["original"] == "I am a software engineer with experience in web development"
        
        # Verify improved is different and not empty
        assert len(data["improved"]) > 0
        
        # Verify word count is a number
        assert isinstance(data["word_count"], int)
        assert data["word_count"] > 0
        
        print(f"SUCCESS: Summary improved, word count: {data['word_count']}")
    
    def test_improve_summary_without_skills(self):
        """Test summary improvement without skills"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={
                "current_summary": "Experienced professional seeking new opportunities"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved" in data
        print("SUCCESS: Summary improved without skills")
    
    def test_improve_summary_with_years_experience(self):
        """Test summary improvement with years of experience"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={
                "current_summary": "Marketing professional with digital marketing experience",
                "job_title": "Marketing Manager",
                "years_experience": 5,
                "skills": ["SEO", "Content Marketing", "Analytics"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved" in data
        print("SUCCESS: Summary improved with years of experience")
    
    def test_improve_summary_missing_field(self):
        """Test that missing current_summary field returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={}
        )
        assert response.status_code == 422
        print("SUCCESS: Missing field returns 422 validation error")


class TestEmailTemplatesEndpoint:
    """Tests for email templates endpoint (regression)"""
    
    def test_list_email_templates(self):
        """Test listing available email templates"""
        response = requests.get(f"{BASE_URL}/api/career-tools/email-templates")
        assert response.status_code == 200
        data = response.json()
        
        assert "templates" in data
        assert isinstance(data["templates"], list)
        assert len(data["templates"]) >= 4  # At least 4 template types
        
        # Verify template structure
        for template in data["templates"]:
            assert "type" in template
            assert "name" in template
            assert "description" in template
        
        print(f"SUCCESS: Found {len(data['templates'])} email templates")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
