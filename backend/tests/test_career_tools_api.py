"""
Backend API tests for Career Tools - Hybrid AI System
Tests: improve-bullet, improve-summary, email-template endpoints
"""
import pytest
import requests
import os

BASE_URL = "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


class TestImproveBulletEndpoint:
    """Tests for /api/career-tools/improve-bullet endpoint"""
    
    def test_improve_bullet_basic(self):
        """Test bullet point improvement with basic text"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": "helped with managing team and worked on sales projects",
                "job_title": "Sales Manager"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "original" in data
        assert "improved" in data
        assert "suggestions" in data
        
        # Verify original is preserved
        assert data["original"] == "helped with managing team and worked on sales projects"
        
        # Verify improved is different and non-empty
        assert len(data["improved"]) > 0
        assert data["improved"] != data["original"]
        
        # Verify suggestions is a list
        assert isinstance(data["suggestions"], list)
        
        print(f"✓ Bullet improvement returned: {data['improved'][:50]}...")
        print(f"✓ Suggestions count: {len(data['suggestions'])}")
    
    def test_improve_bullet_without_job_title(self):
        """Test bullet improvement without job title"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": "was responsible for customer service"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved" in data
        assert len(data["improved"]) > 0
        print("✓ Bullet improvement without job title works")
    
    def test_improve_bullet_empty_text(self):
        """Test bullet improvement with empty text"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json={
                "bullet_point": ""
            }
        )
        # Should still return 200 but with minimal improvement
        assert response.status_code == 200
        print("✓ Empty bullet point handled gracefully")


class TestImproveSummaryEndpoint:
    """Tests for /api/career-tools/improve-summary endpoint"""
    
    def test_improve_summary_basic(self):
        """Test summary improvement with basic text"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={
                "current_summary": "I am a hard worker and team player with excellent communication skills",
                "job_title": "Software Engineer",
                "skills": ["Python", "JavaScript", "React"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "original" in data
        assert "improved" in data
        assert "word_count" in data
        
        # Verify original is preserved
        assert data["original"] == "I am a hard worker and team player with excellent communication skills"
        
        # Verify improved is different
        assert len(data["improved"]) > 0
        
        # Verify word_count is a number
        assert isinstance(data["word_count"], int)
        assert data["word_count"] > 0
        
        print(f"✓ Summary improvement returned: {data['improved'][:50]}...")
        print(f"✓ Word count: {data['word_count']}")
    
    def test_improve_summary_without_skills(self):
        """Test summary improvement without skills"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json={
                "current_summary": "Experienced professional looking for new opportunities"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improved" in data
        print("✓ Summary improvement without skills works")


class TestEmailTemplateEndpoint:
    """Tests for /api/career-tools/email-template endpoint"""
    
    def test_email_template_thank_you(self):
        """Test thank you email generation"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json={
                "template_type": "thank_you",
                "company_name": "Google",
                "job_title": "Software Engineer",
                "interviewer_name": "Sarah Johnson",
                "interview_date": "January 15, 2026"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "subject" in data
        assert "body" in data
        assert "template_type" in data
        
        # Verify content
        assert len(data["subject"]) > 0
        assert len(data["body"]) > 0
        assert data["template_type"] == "thank_you"
        
        print(f"✓ Thank you email subject: {data['subject']}")
        print(f"✓ Email body length: {len(data['body'])} chars")
    
    def test_email_template_follow_up(self):
        """Test follow up email generation"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json={
                "template_type": "follow_up",
                "company_name": "Microsoft",
                "job_title": "Product Manager"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["template_type"] == "follow_up"
        assert len(data["body"]) > 0
        print("✓ Follow up email generated successfully")
    
    def test_email_template_negotiation(self):
        """Test negotiation email generation"""
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json={
                "template_type": "negotiation",
                "company_name": "Amazon",
                "job_title": "Senior Developer",
                "specific_points": "5 years of experience in cloud technologies"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["template_type"] == "negotiation"
        print("✓ Negotiation email generated successfully")


class TestEmailTemplatesList:
    """Tests for /api/career-tools/email-templates list endpoint"""
    
    def test_list_email_templates(self):
        """Test listing available email templates"""
        response = requests.get(f"{BASE_URL}/api/career-tools/email-templates")
        assert response.status_code == 200
        data = response.json()
        
        assert "templates" in data
        assert isinstance(data["templates"], list)
        assert len(data["templates"]) >= 5
        
        # Verify template structure
        template_types = [t["type"] for t in data["templates"]]
        assert "thank_you" in template_types
        assert "follow_up" in template_types
        assert "negotiation" in template_types
        assert "accept" in template_types
        assert "decline" in template_types
        
        print(f"✓ Found {len(data['templates'])} email templates")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
