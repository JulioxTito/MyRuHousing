import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#f7f7f7',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  margin: '20px',
};

/*const headingStyle = {
  color: '#333',
  marginBottom: '20px',
};*/

const formStyle = {
  width: '100%',
  maxWidth: '400px',
};

const formGroupStyle = {
  marginBottom: '15px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  color: '#555',          // changed from #555 to pure black
  fontWeight: 'bold',
};


const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px',
  boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>\')',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px top 50%',
  backgroundSize: '16px',
};

/*const submitButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '12px 20px',
  border: 'none',
  borderRadius: '4px',
  fontSize: '18px',
  cursor: 'pointer',
  width: '100%',
  transition: 'background-color 0.3s ease',
};*/

const submitButtonHoverStyle = {
  backgroundColor: '#0056b3',
};

const importanceSelectStyle = {
  ...selectStyle,
  width: '100px', 
  marginLeft: '10px',
  fontSize: '12px',
  padding: '5px',
  marginBottom: '5px',
};

const preferenceRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '300px',
};

function RoommatesForm({ firstName: initialFirstName, lastName: initialLastName, userId }) {
  const [firstName, setFirstName] = useState(initialFirstName || '');
  const [lastName, setLastName] = useState(initialLastName || '');
  const [gender, setGender] = useState('');
  const [genderImportance, setGenderImportance] = useState('not important');
  const [graduationYear, setGraduationYear] = useState('');
  const [graduationYearImportance, setGraduationYearImportance] = useState('not important');
  const [major, setMajor] = useState('');
  const [majorImportance, setMajorImportance] = useState('not important');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredLocationImportance, setPreferredLocationImportance] = useState('not important');
  const [durationOfStay, setDurationOfStay] = useState('');
  const [durationOfStayImportance, setDurationOfStayImportance] = useState('not important');
  const [allergies, setAllergies] = useState('');
  const [allergiesImportance, setAllergiesImportance] = useState('not important');
  const [hasPets, setHasPets] = useState('');
  const [hasPetsImportance, setHasPetsImportance] = useState('not important');
  const [cookingFrequency, setCookingFrequency] = useState('');
  const [cookingFrequencyImportance, setCookingFrequencyImportance] = useState('not important');
  const [sleepSchedule, setSleepSchedule] = useState('');
  const [sleepScheduleImportance, setSleepScheduleImportance] = useState('not important');
  const [studyHabits, setStudyHabits] = useState('');
  const [studyHabitsImportance, setStudyHabitsImportance] = useState('not important');
  const [cleanliness, setCleanliness] = useState('');
  const [cleanlinessImportance, setCleanlinessImportance] = useState('not important');
  const [selfDescription, setSelfDescription] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFirstName(initialFirstName || '');
  }, [initialFirstName]);

  useEffect(() => {
    setLastName(initialLastName || '');
  }, [initialLastName]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selfDescription.length < 10) {
      setSubmissionStatus('Please include a brief description of yourself with a minimum of 20 words.');
      return;
    }

    const preferencesData = {
      userId: userId,
      first_name: firstName,
      last_name: lastName,
      gender: gender,
      gender_importance: genderImportance,
      graduation_year: graduationYear,
      graduation_year_importance: graduationYearImportance,
      major: major,
      major_importance: majorImportance,
      preferred_location: preferredLocation,
      preferred_location_importance: preferredLocationImportance,
      duration_of_stay: durationOfStay,
      duration_of_stay_importance: durationOfStayImportance,
      allergies: allergies,
      allergies_importance: allergiesImportance,
      has_pets: hasPets,
      has_pets_importance: hasPetsImportance,
      cooking_frequency: cookingFrequency,
      cooking_frequency_importance: cookingFrequencyImportance,
      sleep_schedule: sleepSchedule,
      sleep_schedule_importance: sleepScheduleImportance,
      study_habits: studyHabits,
      study_habits_importance: studyHabitsImportance,
      cleanliness: cleanliness,
      cleanliness_importance: cleanlinessImportance,
      self_description: selfDescription,
    };

    console.log("Data being sent:", preferencesData);

    try {
      const response = await fetch('http://myruhousing-1.onrender.com/api/submit-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesData),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionStatus(data.message);
        localStorage.setItem('userPreferences', JSON.stringify(preferencesData));
        navigate('/matched-profiles');
        setGender('');
        setGenderImportance('not important');
        setGraduationYear('');
        setGraduationYearImportance('not important');
        setMajor('');
        setMajorImportance('not important');
        setPreferredLocation('');
        setPreferredLocationImportance('not important');
        setDurationOfStay('');
        setDurationOfStayImportance('not important');
        setAllergies('');
        setAllergiesImportance('not important');
        setHasPets('');
        setHasPetsImportance('not important');
        setCookingFrequency('');
        setCookingFrequencyImportance('not important');
        setSleepSchedule('');
        setSleepScheduleImportance('not important');
        setStudyHabits('');
        setStudyHabitsImportance('not important');
        setCleanliness('');
        setCleanlinessImportance('not important');
        setSelfDescription('');
      } else {
        const errorData = await response.json();
        setSubmissionStatus(`Submission failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setSubmissionStatus(`Submission failed: ${error.message}`);
    }
  };

  const renderPreferenceRow = (label, id, value, onChange, options, importanceValue, onImportanceChange) => (
    <div style={formGroupStyle} key={id}>
      <div style={preferenceRowStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <select
          id={`${id}Importance`}
          value={importanceValue}
          onChange={onImportanceChange}
          style={importanceSelectStyle}
        >
          <option value="not important">Not Important</option>
          <option value="important">Important</option>
          <option value="very important">Very Important</option>
        </select>
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={!['preferredLocation', 'allergies'].includes(id)}
        style={selectStyle}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {['preferredLocation', 'allergies'].includes(id) && <option value="Other">Other</option>}
      </select>
    </div>
  );

  const renderTextRow = (label, id, value, onChange) => (
    <div style={formGroupStyle} key={id}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={id}
        placeholder={`Enter your ${label.toLowerCase()}`}
        value={value}
        onChange={(e) => {
          onChange(e);
          console.log(`State for ${id}:`, e.target.value);
        }}
        required
        style={inputStyle}
      />
    </div>
  );

  const renderYesNoRow = (label, id, value, onChange, importanceValue, onImportanceChange) => (
    <div style={formGroupStyle} key={id}>
      <div style={preferenceRowStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <select
          id={`${id}Importance`}
          value={importanceValue}
          onChange={onImportanceChange}
          style={importanceSelectStyle}
        >
          <option value="not important">Not Important</option>
          <option value="important">Important</option>
          <option value="very important">Very Important</option>
        </select>
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required
        style={selectStyle}
      >
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>
  );

  const renderCookingFrequencyRow = (label, id, value, onChange, importanceValue, onImportanceChange) => (
    <div style={formGroupStyle} key={id}>
      <div style={preferenceRowStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <select
          id={`${id}Importance`}
          value={importanceValue}
          onChange={onImportanceChange}
          style={importanceSelectStyle}
        >
          <option value="not important">Not Important</option>
          <option value="important">Important</option>
          <option value="very important">Very Important</option>
        </select>
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required
        style={selectStyle}
      >
        <option value="">Select frequency</option>
        <option value="I cook all the time">I cook all the time</option>
        <option value="I cook a few times a week">I cook a few times a week</option>
        <option value="I don't cook">I don't cook</option>
      </select>
    </div>
  );

  const renderSleepScheduleRow = (label, id, value, onChange, importanceValue, onImportanceChange) => (
    <div style={formGroupStyle} key={id}>
      <div style={preferenceRowStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <select
          id={`${id}Importance`}
          value={importanceValue}
          onChange={onImportanceChange}
          style={importanceSelectStyle}
        >
          <option value="not important">Not Important</option>
          <option value="important">Important</option>
          <option value="very important">Very Important</option>
        </select>
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required
        style={selectStyle}
      >
        <option value="">Select your sleep schedule</option>
        <option value="Early Bird (Morning)">Early Bird (Morning)</option>
        <option value="Night Owl (Evening)">Night Owl (Evening)</option>
        <option value="Flexible">Flexible</option>
      </select>
    </div>
  );

  const renderStudyHabitsRow = (label, id, value, onChange, importanceValue, onImportanceChange) => (
    <div style={formGroupStyle} key={id}>
      <div style={preferenceRowStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <select
          id={`${id}Importance`}
          value={importanceValue}
          onChange={onImportanceChange}
          style={importanceSelectStyle}
        >
          <option value="not important">Not Important</option>
          <option value="important">Important</option>
          <option value="very important">Very Important</option>
        </select>
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required
        style={selectStyle}
      >
        <option value="">Select your study habits</option>
        <option value="Quiet and Focused">Quiet and Focused</option>
        <option value="Collaborative Study Groups">Collaborative Study Groups</option>
        <option value="Mix of Both">Mix of Both</option>
      </select>
    </div>
  );

  const renderCleanlinessRow = (label, id, value, onChange, importanceValue, onImportanceChange) => (
    <div style={formGroupStyle} key={id}>
      <div style={preferenceRowStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <select
          id={`${id}Importance`}
          value={importanceValue}
          onChange={onImportanceChange}
          style={importanceSelectStyle}
        >
          <option value="not important">Not Important</option>
          <option value="important">Important</option>
          <option value="very important">Very Important</option>
        </select>
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required
        style={selectStyle}
      >
        <option value="">Select your cleanliness preference</option>
        <option value="Very Clean">Very Clean</option>
        <option value="Moderately Clean">Moderately Clean</option>
        <option value="Tolerant">Tolerant</option>
      </select>
    </div>
  );

  const renderSelfDescription = (label, id, value, onChange) => (
    <div style={formGroupStyle} key={id}>
      <label htmlFor={id} style={labelStyle}>
        {label} (Minimum 200 characters)
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        required
        style={textareaStyle}
      />
    </div>
  );

  return (
    <div style={formContainerStyle}>
      <div className="roommate-preference-header">
  <h3>Please enter your preferences to find your roommates!</h3>
  <p className="preference-subtext">
    Rate your preferences by choosing <strong>"Not Important"</strong>, <strong>"Important"</strong>, or <strong>"Very Important"</strong>
  </p>
</div>

      <form onSubmit={handleSubmit} style={formStyle}>
        {renderTextRow('First Name', 'firstName', firstName, (e) => setFirstName(e.target.value))}
        {renderTextRow('Last Name', 'lastName', lastName, (e) => setLastName(e.target.value))}
        {renderPreferenceRow('Gender', 'gender', gender, (e) => setGender(e.target.value), ['Male', 'Female', 'Other', 'Prefer not to say'], genderImportance, (e) => setGenderImportance(e.target.value))}
        {renderPreferenceRow('Graduation Year', 'graduationYear', graduationYear, (e) => setGraduationYear(e.target.value), ['2026', '2027', '2028', '2029', '2030'], graduationYearImportance, (e) => setGraduationYearImportance(e.target.value))}
        {renderPreferenceRow('Major', 'major', major, (e) => setMajor(e.target.value), ['Engineering', 'Computer Science', 'Business', 'Biology', 'Communications', 'Pre-Med', 'Finance', 'English Literature'], majorImportance, (e) => setMajorImportance(e.target.value))}
        {renderPreferenceRow('Preferred Place to Stay', 'preferredLocation', preferredLocation, (e) => setPreferredLocation(e.target.value), ['Piscataway', 'New Brunswick', 'Somerset', 'South Plainfield', 'Bridgewater', 'Edison'], preferredLocationImportance, (e) => setPreferredLocationImportance(e.target.value))}
        {renderPreferenceRow('Duration of Stay', 'durationOfStay', durationOfStay, (e) => setDurationOfStay(e.target.value), ['One Semester', 'Two Semesters'], durationOfStayImportance, (e) => setDurationOfStayImportance(e.target.value))}
        {renderPreferenceRow('Allergies', 'allergies', allergies, (e) => setAllergies(e.target.value), ['None', 'Seasonal Allergies', 'Food Allergies'], allergiesImportance, (e) => setAllergiesImportance(e.target.value))}
        {renderYesNoRow('Do you have any pets?', 'hasPets', hasPets, (e) => setHasPets(e.target.value), hasPetsImportance, (e) => setHasPetsImportance(e.target.value))}
        {renderCookingFrequencyRow('How often do you cook?', 'cookingFrequency', cookingFrequency, (e) => setCookingFrequency(e.target.value), cookingFrequencyImportance, (e) => setCookingFrequencyImportance(e.target.value))}
        {renderSleepScheduleRow('Sleep Schedule', 'sleepSchedule', sleepSchedule, (e) => setSleepSchedule(e.target.value), sleepScheduleImportance, (e) => setSleepScheduleImportance(e.target.value))}
        {renderStudyHabitsRow('Study Habits', 'studyHabits', studyHabits, (e) => setStudyHabits(e.target.value), studyHabitsImportance, (e) => setStudyHabitsImportance(e.target.value))}
        {renderCleanlinessRow('Cleanliness', 'cleanliness', cleanliness, (e) => setCleanliness(e.target.value), cleanlinessImportance, (e) => setCleanlinessImportance(e.target.value))}
        {renderSelfDescription('Include a brief description of yourself', 'selfDescription', selfDescription, (e) => setSelfDescription(e.target.value))}

        <button type="submit" className="submit-preferences-button">
  Submit Preferences
</button>


        {submissionStatus && <p>{submissionStatus}</p>}
      </form>
    </div>
  );
}

export default RoommatesForm;
