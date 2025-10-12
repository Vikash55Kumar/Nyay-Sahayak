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
      category: "ST",
      certificateNumber: "RSC/2023/SJE/184592",
      issueDate: "2023-03-15",
      issuer: "Government of Rajasthan, Revenue Department"
    },
    // "987654321098": {
    //   applicantName: "Ravi Kumar",
    //   fatherName: "Suresh Kumar",
    //   caste: "Bairwa",
    //   category: "SC",
    //   certificateNumber: "RSC/2022/SJE/156743",
    //   issueDate: "2022-11-20",
    //   issuer: "Government of Rajasthan, Revenue Department"
    // },
    "456789012345": {
      applicantName: "Priya Sharma",
      fatherName: "Rajesh Sharma",
      caste: "Meena",
      category: "ST",
      certificateNumber: "RSC/2023/SJE/192847",
      issueDate: "2023-08-10",
      issuer: "Government of Rajasthan, Revenue Department"
    },
    "234567890123": {
      applicantName: "Arjun Singh",
      fatherName: "Baldev Singh",
      caste: "Kurmi",
      category: "OBC",
      certificateNumber: "UPC/2022/OBC/298745",
      issueDate: "2022-09-12",
      issuer: "Government of Uttar Pradesh, Social Welfare Department"
    },
    "345678901234": {
      applicantName: "Sunita Kumari",
      fatherName: "Ram Prasad",
      caste: "Chamar",
      category: "SC",
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
    }
  };

  // Mock CCTNS (Crime and Criminal Tracking Network & Systems) Database
  static cctnsDatabase: { [key: string]: any } = {
    "FIR/2024/JOD/001234": {
      firNumber: "FIR/2024/JOD/001234",
      policeStation: "Jodhpur City Police Station",
      district: "Jodhpur",
      state: "Rajasthan",
      dateOfIncident: "2024-08-15",
      firRegistrationDate: "2024-08-16",
      incidentType: "Caste-based Atrocity",
      sectionsApplied: ["IPC 323", "IPC 504", "SC/ST Act 3(1)(x)", "SC/ST Act 3(2)(v)"],
      victimDetails: {
        name: "Geeta Devi",
        aadhaarNumber: "123456789012",
        category: "ST",
        address: "Village Luni, Jodhpur"
      },
      accusedDetails: [
        {
          name: "Ramesh Singh",
          address: "Jodhpur City",
          status: "Arrested"
        }
      ],
      investigatingOfficer: "SI Rajesh Kumar",
      firStatus: "Under Investigation",
      verificationStatus: "VERIFIED",
      courtReferenceNumber: "GR/2024/JOD/567"
    },
    "FIR/2024/JAI/002156": {
      firNumber: "FIR/2024/JAI/002156",
      policeStation: "Malviya Nagar Police Station",
      district: "Jaipur",
      state: "Rajasthan",
      dateOfIncident: "2024-07-20",
      firRegistrationDate: "2024-07-22",
      incidentType: "Caste-based Violence",
      sectionsApplied: ["IPC 294", "IPC 323", "IPC 506", "SC/ST Act 3(1)(r)", "SC/ST Act 3(2)(v)"],
      victimDetails: {
        name: "Ravi Kumar",
        aadhaarNumber: "987654321098",
        category: "SC",
        address: "Malviya Nagar, Jaipur"
      },
      accusedDetails: [
        {
          name: "Vikram Sharma",
          address: "Jaipur",
          status: "On Bail"
        }
      ],
      investigatingOfficer: "ASI Priya Sharma",
      firStatus: "Chargesheet Filed",
      verificationStatus: "VERIFIED",
      courtReferenceNumber: "GR/2024/JAI/789"
    },
    "FIR/2024/UDP/003789": {
      firNumber: "FIR/2024/UDP/003789",
      policeStation: "City Police Station Udaipur",
      district: "Udaipur",
      state: "Rajasthan",
      dateOfIncident: "2024-09-10",
      firRegistrationDate: "2024-09-11",
      incidentType: "Discrimination and Abuse",
      sectionsApplied: ["IPC 354", "IPC 504", "SC/ST Act 3(1)(w)", "SC/ST Act 3(2)(v)"],
      victimDetails: {
        name: "Priya Sharma",
        aadhaarNumber: "456789012345",
        category: "ST",
        address: "Civil Lines, Udaipur"
      },
      accusedDetails: [
        {
          name: "Mohan Gupta",
          address: "Udaipur",
          status: "Absconding"
        }
      ],
      investigatingOfficer: "Inspector Suresh Meena",
      firStatus: "Under Investigation",
      verificationStatus: "VERIFIED",
      courtReferenceNumber: "GR/2024/UDP/456"
    }
  };

  // Mock eCourt Database
  static eCourtDatabase: { [key: string]: any } = {
    "GR/2024/JOD/567": {
      caseNumber: "GR/2024/JOD/567",
      firNumber: "FIR/2024/JOD/001234",
      courtName: "Chief Judicial Magistrate Court, Jodhpur",
      judge: "Smt. Sunita Sharma",
      caseType: "Session Trial",
      caseStage: "Evidence Recording",
      nextHearingDate: "2024-11-15",
      chargesheetDate: "2024-09-20",
      trialStartDate: "2024-10-05",
      compensationStage: "CHARGESHEET_FILED",
      compensationEligible: true,
      compensationAmount: 50000, // Stage 2 compensation
      previousCompensations: [
        {
          stage: "FIR_REGISTERED",
          amount: 25000,
          disbursedDate: "2024-08-20",
          status: "DISBURSED"
        }
      ],
      caseStatus: "Active",
      lastUpdated: "2024-10-10"
    },
    "GR/2024/JAI/789": {
      caseNumber: "GR/2024/JAI/789",
      firNumber: "FIR/2024/JAI/002156",
      courtName: "Additional District Judge Court, Jaipur",
      judge: "Shri Ramesh Chandra",
      caseType: "Session Trial",
      caseStage: "Trial Completed",
      judgmentDate: "2024-10-01",
      chargesheetDate: "2024-08-25",
      trialStartDate: "2024-09-10",
      verdict: "Conviction",
      compensationStage: "JUDGMENT_CONVICTED",
      compensationEligible: true,
      compensationAmount: 100000, // Final compensation
      previousCompensations: [
        {
          stage: "FIR_REGISTERED",
          amount: 25000,
          disbursedDate: "2024-07-25",
          status: "DISBURSED"
        },
        {
          stage: "CHARGESHEET_FILED",
          amount: 50000,
          disbursedDate: "2024-08-30",
          status: "DISBURSED"
        }
      ],
      caseStatus: "Disposed",
      lastUpdated: "2024-10-01"
    },
    "GR/2024/UDP/456": {
      caseNumber: "GR/2024/UDP/456",
      firNumber: "FIR/2024/UDP/003789",
      courtName: "Chief Judicial Magistrate Court, Udaipur",
      judge: "Shri Anil Kumar Meena",
      caseType: "Magistrate Trial",
      caseStage: "Cognizance Taken",
      nextHearingDate: "2024-11-20",
      chargesheetDate: null, // Not yet filed
      compensationStage: "FIR_REGISTERED",
      compensationEligible: true,
      compensationAmount: 25000, // Initial compensation
      previousCompensations: [],
      caseStatus: "Active",
      lastUpdated: "2024-09-15"
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

  // CCTNS FIR Verification
  static verifyFIRInCCTNS(firNumber: string, policeStation: string, district: string) {
    const firData = this.cctnsDatabase[firNumber];
    
    if (!firData) {
      return {
        success: false,
        message: "FIR not found in CCTNS database",
        data: null
      };
    }

    // Verify police station and district match
    if (firData.policeStation.toLowerCase() !== policeStation.toLowerCase() ||
        firData.district.toLowerCase() !== district.toLowerCase()) {
      return {
        success: false,
        message: "FIR details do not match CCTNS records",
        data: null
      };
    }

    // Check if FIR is under SC/ST Act
    const hasSCSTSections = firData.sectionsApplied.some((section: string) => 
      section.toLowerCase().includes('sc/st act'));

    if (!hasSCSTSections) {
      return {
        success: false,
        message: "FIR is not registered under SC/ST Act sections",
        data: null
      };
    }

    return {
      success: true,
      message: "FIR verified successfully in CCTNS",
      data: {
        firNumber: firData.firNumber,
        policeStation: firData.policeStation,
        district: firData.district,
        state: firData.state,
        dateOfIncident: firData.dateOfIncident,
        firRegistrationDate: firData.firRegistrationDate,
        incidentType: firData.incidentType,
        sectionsApplied: firData.sectionsApplied,
        victimDetails: firData.victimDetails,
        investigatingOfficer: firData.investigatingOfficer,
        firStatus: firData.firStatus,
        verificationStatus: firData.verificationStatus,
        courtReferenceNumber: firData.courtReferenceNumber
      }
    };
  }

  // Verify victim in FIR matches beneficiary
  static verifyVictimInFIR(firNumber: string, beneficiaryAadhaar: string) {
    const firData = this.cctnsDatabase[firNumber];
    
    if (!firData) {
      return {
        success: false,
        message: "FIR not found",
        isVictim: false
      };
    }

    const isVictim = firData.victimDetails.aadhaarNumber === beneficiaryAadhaar;
    
    return {
      success: true,
      message: isVictim ? "Beneficiary is verified as victim in FIR" : "Beneficiary is not the victim in this FIR",
      isVictim,
      victimDetails: firData.victimDetails
    };
  }

  // Get case status from eCourt
  static getCaseStatusFromeCourt(firNumber: string) {
    // Find case by FIR number
    const caseEntry = Object.values(this.eCourtDatabase).find((caseData: any) => 
      caseData.firNumber === firNumber);

    if (!caseEntry) {
      return {
        success: false,
        message: "Case not found in eCourt database",
        data: null
      };
    }

    return {
      success: true,
      message: "Case details retrieved from eCourt",
      data: {
        caseNumber: caseEntry.caseNumber,
        firNumber: caseEntry.firNumber,
        courtName: caseEntry.courtName,
        judge: caseEntry.judge,
        caseType: caseEntry.caseType,
        caseStage: caseEntry.caseStage,
        compensationStage: caseEntry.compensationStage,
        compensationEligible: caseEntry.compensationEligible,
        compensationAmount: caseEntry.compensationAmount,
        previousCompensations: caseEntry.previousCompensations,
        caseStatus: caseEntry.caseStatus,
        nextHearingDate: caseEntry.nextHearingDate,
        lastUpdated: caseEntry.lastUpdated
      }
    };
  }

  // Get compensation eligibility and amount
  static getCompensationDetails(firNumber: string) {
    const caseStatus = this.getCaseStatusFromeCourt(firNumber);
    
    if (!caseStatus.success || !caseStatus.data) {
      return {
        success: false,
        message: "Cannot determine compensation eligibility - case not found",
        eligible: false,
        amount: 0,
        stage: null
      };
    }

    const caseData = caseStatus.data;
    
    return {
      success: true,
      message: "Compensation details retrieved",
      eligible: caseData.compensationEligible,
      amount: caseData.compensationAmount,
      stage: caseData.compensationStage,
      previousCompensations: caseData.previousCompensations,
      caseStage: caseData.caseStage
    };
  }
}