export class MockDataService {
  
  // Mock Aadhaar database - simple data storage
  static aadhaarDatabase: { [key: string]: any } = {
    "123456789012": {
      name: "Geeta Devi",
      mobile: "9135842253",
      dateOfBirth: "22-07-1998",
      gender: "F",
      address: {
        careOf: "D/O Ramesh Lal",
        house: "Village Luni",
        locality: "Near Primary School",
        district: "Jodhpur",
        state: "Rajasthan",
        pin: "342802"
      },
      photo: "rWHcAdajJoopFSYqnjNVXYebkngc0UU47mNZ+6j/2Q=="
    },
    "987654321098": {
      name: "Ravi Kumar",
      mobile: "8404858563",
      dateOfBirth: "15-03-1995",
      gender: "M",
      address: {
        careOf: "S/O Suresh Kumar",
        house: "House No 45",
        locality: "Malviya Nagar",
        district: "Jaipur",
        state: "Rajasthan",
        pin: "302017"
      },
      photo: "base64_photo_data_here"
    },
    "456789012345": {
      name: "Priya Sharma",
      mobile: "7654321098",
      dateOfBirth: "10-12-1992",
      gender: "F",
      address: {
        careOf: "D/O Rajesh Sharma",
        house: "Plot No 23",
        locality: "Civil Lines",
        district: "Udaipur",
        state: "Rajasthan",
        pin: "313001"
      },
      photo: "base64_photo_data_here"
    },
    "234567890123": {
      name: "Arjun Singh",
      mobile: "6543210987",
      dateOfBirth: "05-08-1990",
      gender: "M",
      address: {
        careOf: "S/O Baldev Singh",
        house: "Ward No 12",
        locality: "Gandhi Nagar",
        district: "Lucknow",
        state: "Uttar Pradesh",
        pin: "226001"
      },
      photo: "base64_photo_arjun_here"
    },
    "345678901234": {
      name: "Sunita Kumari",
      mobile: "5432109876",
      dateOfBirth: "18-11-1985",
      gender: "F",
      address: {
        careOf: "W/O Mohan Lal",
        house: "Village Dhanbad",
        locality: "Near Post Office",
        district: "Dhanbad",
        state: "Jharkhand",
        pin: "826001"
      },
      photo: "base64_photo_sunita_here"
    }
  };

  // Mock Caste Certificate database - simple data storage
  static casteDatabase: { [key: string]: any } = {
    "123456789012": {
      applicantName: "Geeta Devi",
      fatherName: "Ramesh Lal",
      caste: "Bhil Meena",
      category: "Scheduled Tribe (ST)",
      certificateNumber: "RSC/2023/SJE/184592",
      issueDate: "2023-03-15",
      issuer: "Government of Rajasthan, Revenue Department"
    },
    "987654321098": {
      applicantName: "Ravi Kumar",
      fatherName: "Suresh Kumar",
      caste: "Bairwa",
      category: "Scheduled Caste (SC)",
      certificateNumber: "RSC/2022/SJE/156743",
      issueDate: "2022-11-20",
      issuer: "Government of Rajasthan, Revenue Department"
    },
    "456789012345": {
      applicantName: "Priya Sharma",
      fatherName: "Rajesh Sharma",
      caste: "Meena",
      category: "Scheduled Tribe (ST)",
      certificateNumber: "RSC/2023/SJE/192847",
      issueDate: "2023-08-10",
      issuer: "Government of Rajasthan, Revenue Department"
    },
    "234567890123": {
      applicantName: "Arjun Singh",
      fatherName: "Baldev Singh",
      caste: "Kurmi",
      category: "Other Backward Class (OBC)",
      certificateNumber: "UPC/2022/OBC/298745",
      issueDate: "2022-09-12",
      issuer: "Government of Uttar Pradesh, Social Welfare Department"
    },
    "345678901234": {
      applicantName: "Sunita Kumari",
      fatherName: "Ram Prasad",
      caste: "Chamar",
      category: "Scheduled Caste (SC)",
      certificateNumber: "JHC/2023/SC/176934",
      issueDate: "2023-01-25",
      issuer: "Government of Jharkhand, Welfare Department"
    }
  };

  // Mock Marriage Certificate database for Intercaste Marriage verification
  static marriageDatabase: { [key: string]: any } = {
    "RJ-MARR-2024-000123": {
      marriageRegistrationId: "RJ-MARR-2024-000123",
      marriageDate: "2024-05-20",
      registrationAuthority: "Municipal Corporation Jaipur",
      husband: {
        name: "Ravi Kumar",
        aadhaarNumber: "987654321098",
        category: "SC"
      },
      wife: {
        name: "Priya Sharma",
        aadhaarNumber: "456789012345", 
        category: "ST"
      },
      verificationStatus: "VERIFIED",
      issuedAt: "2024-05-22",
      certificateUrl: "https://marriage.rajasthan.gov.in/certificate/RJ-MARR-2024-000123.pdf"
    },
    "RJ-MARR-2024-000124": {
      marriageRegistrationId: "RJ-MARR-2024-000124",
      marriageDate: "2024-03-15",
      registrationAuthority: "Municipal Corporation Jodhpur",
      husband: {
        name: "Arjun Singh",
        aadhaarNumber: "234567890123",
        category: "OBC"
      },
      wife: {
        name: "Geeta Devi",
        aadhaarNumber: "123456789012",
        category: "ST"
      },
      verificationStatus: "VERIFIED",
      issuedAt: "2024-03-18",
      certificateUrl: "https://marriage.rajasthan.gov.in/certificate/RJ-MARR-2024-000124.pdf"
    },
    "RJ-MARR-2024-000125": {
      marriageRegistrationId: "RJ-MARR-2024-000125",
      marriageDate: "2024-08-10",
      registrationAuthority: "Municipal Corporation Udaipur",
      husband: {
        name: "Mohan Lal",
        aadhaarNumber: "567890123456",
        category: "GENERAL"
      },
      wife: {
        name: "Sunita Kumari",
        aadhaarNumber: "345678901234",
        category: "SC"
      },
      verificationStatus: "PENDING",
      issuedAt: "2024-08-12",
      certificateUrl: "https://marriage.rajasthan.gov.in/certificate/RJ-MARR-2024-000125.pdf"
    }
  };

  // Verify Aadhaar + Mobile and return data if successful
  static verifyAadhaarAndMobile(aadhaarNumber: string, mobileNumber: string) {
    const userData = this.aadhaarDatabase[aadhaarNumber];
    
    if (!userData) {
      return {
        success: false,
        message: "Aadhaar number not found",
        data: null
      };
    }

    if (userData.mobile !== mobileNumber) {
      return {
        success: false,
        message: "Mobile number does not match with Aadhaar records",
        data: null
      };
    }

    // Success - return response format
    return {
      success: true,
      message: "Aadhaar eKYC Successful",
      data: {
        transaction_id: "f6efc218742a405c8dd65cf" + Date.now(),
        timestamp: Date.now(),
        aadhaar: {
          name: userData.name,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
          maskedNumber: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`,
          photo: userData.photo
        }
      }
    };
  }

  // Get caste certificate if exists
  static getCasteCertificate(aadhaarNumber: string) {
    const casteData = this.casteDatabase[aadhaarNumber];
    
    if (!casteData) {
      return {
        success: false,
        message: "No caste certificate found in DigiLocker",
        source: "DigiLocker",
        data: null
      };
    }

    return {
      success: true,
      message: "Caste certificate found",
      source: "DigiLocker",
      data: {
        applicantName: casteData.applicantName,
        fatherName: casteData.fatherName,
        caste: casteData.caste,
        category: casteData.category,
        certificateNumber: casteData.certificateNumber,
        issueDate: casteData.issueDate,
        issuer: casteData.issuer,
        verified: true
      }
    };
  }

  // Parse date utility
  static parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Mask Aadhaar number for display
  static maskAadhaar(aadhaarNumber: string): string {
    return `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
  }

  // Legacy method for compatibility (wrapper around verifyAadhaarAndMobile)
  static getAadhaarData(aadhaarNumber: string) {
    const userData = this.aadhaarDatabase[aadhaarNumber];
    if (!userData) return null;
    
    return {
      code: 200,
      message: "Aadhaar eKYC Successful",
      data: {
        name: userData.name,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        photo: userData.photo
      }
    };
  }

  // Verify marriage certificate and get details
  static getMarriageCertificate(marriageRegistrationId: string) {
    const marriageData = this.marriageDatabase[marriageRegistrationId];
    
    if (!marriageData) {
      return {
        success: false,
        message: "Marriage certificate not found",
        data: null
      };
    }

    return {
      success: true,
      message: "Marriage certificate verified successfully",
      data: {
        marriageRegistrationId: marriageData.marriageRegistrationId,
        marriageDate: marriageData.marriageDate,
        registrationAuthority: marriageData.registrationAuthority,
        husband: marriageData.husband,
        wife: marriageData.wife,
        verificationStatus: marriageData.verificationStatus,
        issuedAt: marriageData.issuedAt,
        certificateUrl: marriageData.certificateUrl
      }
    };
  }

  // Verify if marriage is intercaste (between different categories)
  static verifyIntercasteMarriage(marriageRegistrationId: string, applicantAadhaar: string) {
    const marriageData = this.marriageDatabase[marriageRegistrationId];
    
    if (!marriageData) {
      return {
        success: false,
        message: "Marriage certificate not found",
        isIntercaste: false
      };
    }

    // Check if applicant is either husband or wife
    const isHusband = marriageData.husband.aadhaarNumber === applicantAadhaar;
    const isWife = marriageData.wife.aadhaarNumber === applicantAadhaar;
    
    if (!isHusband && !isWife) {
      return {
        success: false,
        message: "Applicant not found in marriage certificate",
        isIntercaste: false
      };
    }

    // Check if categories are different (intercaste)
    const husbandCategory = marriageData.husband.category;
    const wifeCategory = marriageData.wife.category;
    const isIntercaste = husbandCategory !== wifeCategory;

    return {
      success: true,
      message: "Marriage verification completed",
      isIntercaste,
      marriageDetails: {
        applicant: isHusband ? marriageData.husband : marriageData.wife,
        spouse: isHusband ? marriageData.wife : marriageData.husband,
        marriageDate: marriageData.marriageDate,
        registrationAuthority: marriageData.registrationAuthority
      }
    };
  }
}