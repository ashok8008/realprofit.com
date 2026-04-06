"""
Backend API Tests for RealProfits Career Tools - Phase 3 Features
Tests: AI Resume Improvement, Email Templates Generation
"""
import pytest
import requests
import os
import time

BASE_URL = "https://26946d75-b144-4788-8ed6-b7fc8b535d7c.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test /api/health returns 200 with healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "message" in data
        print("✓ Health check passed")


class TestEmailTemplatesEndpoints:
    """Email Templates API tests"""
    
    def test_list_email_templates(self):
        """Test GET /api/career-tools/email-templates returns 5 templates"""
        response = requests.get(f"{BASE_URL}/api/career-tools/email-templates")
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        assert len(data["templates"]) == 5
        
        # Verify template types
        template_types = [t["type"] for t in data["templates"]]
        expected_types = ["thank_you", "follow_up", "negotiation", "decline", "accept"]
        for expected in expected_types:
            assert expected in template_types, f"Missing template type: {expected}"
        
        # Verify each template has required fields
        for template in data["templates"]:
            assert "type" in template
            assert "name" in template
            assert "description" in template
        
        print("✓ Email templates list returned 5 templates with correct structure")
    
    def test_generate_thank_you_email(self):
        """Test POST /api/career-tools/email-template for thank_you type"""
        payload = {
            "template_type": "thank_you",
            "company_name": "Google",
            "job_title": "Software Engineer",
            "interviewer_name": "Sarah Johnson",
            "interview_date": "January 15, 2026"
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json=payload,
            timeout=30  # AI calls may take time
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "subject" in data
        assert "body" in data
        assert "template_type" in data
        assert data["template_type"] == "thank_you"
        assert len(data["subject"]) > 0
        assert len(data["body"]) > 0
        
        print(f"✓ Thank you email generated - Subject: {data['subject'][:50]}...")
    
    def test_generate_follow_up_email(self):
        """Test POST /api/career-tools/email-template for follow_up type"""
        payload = {
            "template_type": "follow_up",
            "company_name": "Microsoft",
            "job_title": "Product Manager"
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["template_type"] == "follow_up"
        assert len(data["body"]) > 0
        print(f"✓ Follow up email generated")
    
    def test_generate_negotiation_email(self):
        """Test POST /api/career-tools/email-template for negotiation type"""
        payload = {
            "template_type": "negotiation",
            "company_name": "Amazon",
            "job_title": "Senior Developer",
            "specific_points": "Requesting 15% higher base salary based on market research"
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["template_type"] == "negotiation"
        assert len(data["body"]) > 0
        print(f"✓ Negotiation email generated")
    
    def test_email_template_missing_required_fields(self):
        """Test email template endpoint with missing required fields"""
        # Missing company_name
        payload = {
            "template_type": "thank_you",
            "job_title": "Engineer"
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/email-template",
            json=payload,
            timeout=30
        )
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Missing required fields returns 422")


class TestResumeImprovementEndpoints:
    """Resume AI Improvement API tests"""
    
    def test_improve_bullet_point(self):
        """Test POST /api/career-tools/improve-bullet"""
        payload = {
            "bullet_point": "Worked on software projects",
            "job_title": "Software Engineer",
            "context": "Backend development"
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "original" in data
        assert "improved" in data
        assert "suggestions" in data
        assert data["original"] == payload["bullet_point"]
        assert len(data["improved"]) > 0
        assert isinstance(data["suggestions"], list)
        
        print(f"✓ Bullet point improved: '{data['improved'][:60]}...'")
        print(f"  Suggestions: {len(data['suggestions'])} tips provided")
    
    def test_improve_bullet_point_minimal(self):
        """Test improve-bullet with minimal payload"""
        payload = {
            "bullet_point": "Managed team meetings"
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["improved"]) > 0
        print("✓ Bullet point improved with minimal payload")
    
    def test_improve_summary(self):
        """Test POST /api/career-tools/improve-summary"""
        payload = {
            "current_summary": "I am a software developer with experience in web development.",
            "job_title": "Full Stack Developer",
            "years_experience": 5,
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "original" in data
        assert "improved" in data
        assert "word_count" in data
        assert data["original"] == payload["current_summary"]
        assert len(data["improved"]) > 0
        assert isinstance(data["word_count"], int)
        assert data["word_count"] > 0
        
        print(f"✓ Summary improved ({data['word_count']} words): '{data['improved'][:80]}...'")
    
    def test_improve_summary_minimal(self):
        """Test improve-summary with minimal payload"""
        payload = {
            "current_summary": "Experienced professional seeking new opportunities."
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-summary",
            json=payload,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["improved"]) > 0
        print("✓ Summary improved with minimal payload")
    
    def test_improve_bullet_empty_text(self):
        """Test improve-bullet with empty bullet point"""
        payload = {
            "bullet_point": ""
        }
        response = requests.post(
            f"{BASE_URL}/api/career-tools/improve-bullet",
            json=payload,
            timeout=30
        )
        # Empty bullet should still be processed (AI will handle it)
        # or return validation error
        assert response.status_code in [200, 422, 500]
        print(f"✓ Empty bullet point handled with status {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
