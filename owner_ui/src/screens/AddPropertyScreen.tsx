import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Info,
  MapPin,
  ListPlus,
  Image as ImageIcon,
  CheckCircle2,
  FileCheck
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../constants/dashboardTheme';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Badge } from '../components/DashboardComponents';

const AMENITY_OPTIONS = [
  'Wi-Fi High-Speed',
  'Private Parking',
  'Fitness Center / Gym',
  '24/7 Security Gate',
  'Air Conditioning',
  'Swimming Pool',
  'Pet Friendly',
  'Furnished Unit',
  'In-unit Washer/Dryer',
];

export const AddPropertyScreen: React.FC = () => {
  const { addProperty, setActiveScreen } = useApp();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Wizard active step: 1 to 5
  const [currentStep, setCurrentStep] = useState(1);

  // Form State variables
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [amenities, setAmenities] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pick images using expo-image-picker
  const handlePickImages = async () => {
    if ((typeof globalThis !== 'undefined' && (globalThis as any).__E2E_MOCK__) || (typeof window !== 'undefined' && (window as any).__E2E_MOCK__)) {
      const mockImages = (window as any).__E2E_MOCK_IMAGES__ || [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
      ];
      setUploadedImages(prev => [...prev, ...mockImages]);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.images;
        return copy;
      });
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access photos is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const selected = result.assets.filter(asset => {
          const ext = asset.uri.split('.').pop()?.toLowerCase() || '';
          const mime = asset.mimeType || '';
          const isValid = allowedExtensions.includes(ext) || mime.startsWith('image/jpeg') || mime.startsWith('image/png');
          if (!isValid) {
            alert(`File type not supported. Please select JPG, JPEG, or PNG images.`);
          }
          return isValid;
        }).map(asset => asset.uri);

        if (selected.length > 0) {
          setUploadedImages(prev => [...prev, ...selected]);
          setErrors(prev => {
            const copy = { ...prev };
            delete copy.images;
            return copy;
          });
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      alert('Failed to pick images.');
    }
  };

  // Remove image from selected photos
  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => {
      const newVal = prev.filter((_, idx) => idx !== indexToRemove);
      if (coverIndex === indexToRemove) {
        setCoverIndex(0);
      } else if (coverIndex > indexToRemove) {
        setCoverIndex(coverIndex - 1);
      }
      return newVal;
    });
  };

  // Replace image at index
  const handleReplaceImage = async (indexToReplace: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access photos is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const ext = asset.uri.split('.').pop()?.toLowerCase() || '';
        const mime = asset.mimeType || '';
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const isValid = allowedExtensions.includes(ext) || mime.startsWith('image/jpeg') || mime.startsWith('image/png');
        
        if (!isValid) {
          alert(`File type not supported. Please select JPG, JPEG, or PNG images.`);
          return;
        }

        setUploadedImages(prev => {
          const newVal = [...prev];
          newVal[indexToReplace] = asset.uri;
          return newVal;
        });
      }
    } catch (error) {
      console.error('Error replacing image:', error);
      alert('Failed to replace image.');
    }
  };

  // Select cover image index
  const handleSelectCover = (index: number) => {
    setCoverIndex(index);
  };

  // Toggle amenities check
  const handleToggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  // Step Validation logic
  const validateStep = (step: number) => {
    const stepErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!name.trim()) stepErrors.name = 'Property name is required';
      if (!description.trim()) stepErrors.description = 'Description is required';
      if (!rent.trim()) stepErrors.rent = 'Monthly rent is required';
      else if (isNaN(Number(rent.replace(/[^0-9]/g, '')))) stepErrors.rent = 'Rent must be a numeric value';
    } else if (step === 2) {
      if (!address.trim()) stepErrors.address = 'Street address is required';
      if (!city.trim()) stepErrors.city = 'City is required';
      if (!state.trim()) stepErrors.state = 'State is required';
      if (!zip.trim()) stepErrors.zip = 'Zip code is required';
    } else if (step === 4) {
      if (uploadedImages.length === 0) {
        stepErrors.images = 'At least one property image is required';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Format rent string
    const cleanRentVal = rent.startsWith('$') ? rent : `$${rent}`;
    
    // Sort uploadedImages so the cover image is at index 0
    let sortedImages = [...uploadedImages];
    if (sortedImages.length > 0 && coverIndex > 0 && coverIndex < sortedImages.length) {
      const coverImg = sortedImages[coverIndex];
      sortedImages.splice(coverIndex, 1);
      sortedImages.unshift(coverImg);
    }

    // Add to global state context
    addProperty({
      name,
      location: `${address}, ${city}, ${state} ${zip}`,
      rent: cleanRentVal,
      status: 'Fraud Check', // sets to initial validation status
      image: sortedImages[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80',
      images: sortedImages,
    });

    // Reset wizard
    setCurrentStep(1);
    setName('');
    setDescription('');
    setRent('');
    setAddress('');
    setCity('');
    setState('');
    setZip('');
    setAmenities([]);
    setUploadedImages([]);
    setCoverIndex(0);

    // Redirect to Properties screen where tracker can be watched
    setActiveScreen('properties');
  };

  // Step names mapping
  const stepsMeta = [
    { label: 'Details', icon: ListPlus },
    { label: 'Location', icon: MapPin },
    { label: 'Amenities', icon: Check },
    { label: 'Images', icon: ImageIcon },
    { label: 'Review', icon: FileCheck },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Dynamic Progress indicator */}
      <Card style={styles.progressCard} className="card-tint-statistics">
        <View style={styles.progressHeader}>
          {stepsMeta.map((sMeta, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            const isPending = currentStep < stepNum;

            let stepColor = Theme.colors.border;
            if (isCompleted) stepColor = Theme.colors.success;
            else if (isActive) stepColor = Theme.colors.primary;

            return (
              <React.Fragment key={idx}>
                <View style={styles.stepBubbleContainer}>
                  <View style={[
                    styles.stepBubble,
                    { borderColor: stepColor },
                    isCompleted && { backgroundColor: Theme.colors.success },
                    isActive && { backgroundColor: Theme.colors.primary }
                  ]}>
                    {isCompleted ? (
                      <Check color="#FFFFFF" size={12} />
                    ) : (
                      <Text style={[
                        styles.stepBubbleText,
                        (isActive || isCompleted) && { color: '#FFFFFF' }
                      ]}>{stepNum}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isActive && { color: Theme.colors.primary, fontWeight: '700' }
                  ]}>{sMeta.label}</Text>
                </View>
                {idx < stepsMeta.length - 1 && (
                  <View style={[
                    styles.stepConnector,
                    currentStep > stepNum && { backgroundColor: Theme.colors.success }
                  ]} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </Card>

      {/* Main Wizard Form View */}
      <Card style={styles.formCard} className="card-tint-property">
        {/* STEP 1: Property Details */}
        {currentStep === 1 && (
          <View style={styles.stepBody}>
            <Text style={styles.formHeader}>Tell Us About the Property</Text>
            <Text style={styles.formSubheader}>Provide simple details to start the fraud checking engine.</Text>

            <Input
              label="Listing Title / Property Name"
              placeholder="e.g. Skyline Luxury Penthouse"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <Input
              label="Monthly Rent (USD)"
              placeholder="e.g. 2100"
              value={rent}
              onChangeText={setRent}
              keyboardType="numeric"
              error={errors.rent}
            />

            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Property Category</Text>
              <View style={styles.categoryGrid}>
                {['Apartment', 'House', 'Studio Loft', 'Townhouse'].map(type => {
                  const isSelected = propertyType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive
                      ]}
                      onPress={() => setPropertyType(type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label="Property Description"
              placeholder="Describe the unit layout, nearby transit options, landlord policies..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              error={errors.description}
            />
          </View>
        )}

        {/* STEP 2: Location Details */}
        {currentStep === 2 && (
          <View style={styles.stepBody}>
            <Text style={styles.formHeader}>Where is the Property Located?</Text>
            <Text style={styles.formSubheader}>Location accuracy determines fraud security score verification.</Text>

            <Input
              label="Street Address"
              placeholder="e.g. 1204 Pine Street, Apt 3B"
              value={address}
              onChangeText={setAddress}
              error={errors.address}
            />

            <View style={styles.rowInputs}>
              <Input
                label="City"
                placeholder="e.g. Seattle"
                value={city}
                onChangeText={setCity}
                style={styles.flex2}
                error={errors.city}
              />
              <View style={{ width: 12 }} />
              <Input
                label="State"
                placeholder="WA"
                value={state}
                onChangeText={setState}
                style={styles.flex1}
                error={errors.state}
              />
            </View>

            <Input
              label="Zip / Postal Code"
              placeholder="e.g. 98101"
              value={zip}
              onChangeText={setZip}
              keyboardType="numeric"
              error={errors.zip}
            />
          </View>
        )}

        {/* STEP 3: Amenities Select */}
        {currentStep === 3 && (
          <View style={styles.stepBody}>
            <Text style={styles.formHeader}>Select Amenities Offered</Text>
            <Text style={styles.formSubheader}>Marking key conveniences increases views conversion rate.</Text>

            <View style={styles.amenitiesGrid}>
              {AMENITY_OPTIONS.map(amenity => {
                const isChecked = amenities.includes(amenity);
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityItem,
                      isChecked && styles.amenityItemActive
                    ]}
                    onPress={() => handleToggleAmenity(amenity)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.checkBox,
                      isChecked && styles.checkBoxActive
                    ]}>
                      {isChecked && <Check color="#FFFFFF" size={12} />}
                    </View>
                    <Text style={[
                      styles.amenityText,
                      isChecked && styles.amenityTextActive
                    ]}>{amenity}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 4: Image Selector */}
        {currentStep === 4 && (
          <View style={styles.stepBody}>
            <Text style={styles.formHeader}>Upload Property Images</Text>
            <Text style={styles.formSubheader}>Provide clear photos of rooms and utilities for safety check.</Text>

            <TouchableOpacity 
              style={styles.uploadArea} 
              activeOpacity={0.8}
              onPress={handlePickImages}
            >
              <Upload color={Theme.colors.primary} size={36} />
              <Text style={styles.uploadTitle}>Drag & Drop files or Browse</Text>
              <Text style={styles.uploadSubtitle}>Supports JPG, JPEG, PNG formats up to 10MB per file</Text>
              
              <View style={styles.browseButtonVisual}>
                <Text style={styles.browseButtonText}>Browse Images</Text>
              </View>
            </TouchableOpacity>

            {errors.images && (
              <Text style={[styles.errorText, { marginBottom: Theme.spacing.md }]}>{errors.images}</Text>
            )}

            {uploadedImages.length > 0 && (
              <>
                <Text style={styles.previewHeader}>Photos Selected ({uploadedImages.length})</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.imagesPreviewScroll}
                >
                  {uploadedImages.map((imgUrl, idx) => {
                    const isCover = idx === coverIndex;
                    return (
                      <View key={idx} style={styles.previewImageCard}>
                        <Image source={{ uri: imgUrl }} style={styles.previewImage} />
                        
                        {/* Top control bar */}
                        <View style={styles.previewControlsTop}>
                          {/* Replace button */}
                          <TouchableOpacity 
                            style={styles.controlIconBtn} 
                            onPress={() => handleReplaceImage(idx)}
                            activeOpacity={0.7}
                          >
                            <Upload color="#FFFFFF" size={12} />
                          </TouchableOpacity>
                          
                          {/* Remove button */}
                          <TouchableOpacity 
                            style={[styles.controlIconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.9)' }]} 
                            onPress={() => handleRemoveImage(idx)}
                            activeOpacity={0.7}
                          >
                            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>✕</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Bottom cover bar */}
                        {isCover ? (
                          <View style={styles.coverIndicator}>
                            <Check color="#FFFFFF" size={10} style={{ marginRight: 4 }} />
                            <Text style={styles.coverText}>COVER IMAGE</Text>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.setCoverBtn}
                            onPress={() => handleSelectCover(idx)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.setCoverText}>Set as Cover</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </View>
        )}

        {/* STEP 5: Final Review & Submit */}
        {currentStep === 5 && (
          <View style={styles.stepBody}>
            <Text style={styles.formHeader}>Review Property Credentials</Text>
            <Text style={styles.formSubheader}>Confirm details before initiating automated identity check.</Text>

            {/* Verification summary panel */}
            <View style={styles.reviewWrapper}>
              <Image 
                source={{ uri: uploadedImages[coverIndex] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80' }} 
                style={styles.reviewImage} 
              />
              <View style={styles.reviewMain}>
                <Text style={styles.reviewName}>{name}</Text>
                <Text style={styles.reviewRent}>{rent} <Text style={{ fontWeight: 'normal', color: Theme.colors.textSecondary, fontSize: 12 }}>per month</Text></Text>
                <Text style={styles.reviewLoc}>{address}, {city}, {state} {zip}</Text>
              </View>
            </View>

            <View style={styles.reviewDetailsList}>
              <View style={styles.reviewDetailRow}>
                <Text style={styles.reviewDetailLabel}>Property Type</Text>
                <Text style={styles.reviewDetailVal}>{propertyType}</Text>
              </View>
              <View style={styles.reviewDetailRow}>
                <Text style={styles.reviewDetailLabel}>Description</Text>
                <Text style={styles.reviewDetailVal} numberOfLines={3}>{description}</Text>
              </View>
              <View style={styles.reviewDetailRow}>
                <Text style={styles.reviewDetailLabel}>Amenities ({amenities.length})</Text>
                <Text style={styles.reviewDetailVal} numberOfLines={2}>
                  {amenities.length > 0 ? amenities.join(', ') : 'None selected'}
                </Text>
              </View>
              <View style={styles.reviewDetailRow}>
                <Text style={styles.reviewDetailLabel}>Images ({uploadedImages.length})</Text>
                <Text style={styles.reviewDetailVal}>
                  {uploadedImages.length > 0 ? `${uploadedImages.length} photo(s) selected` : 'No photos selected'}
                </Text>
              </View>
            </View>

            <View style={[styles.infoBanner, { backgroundColor: 'rgba(37, 99, 235, 0.10)' }]}>
              <Info color={Theme.colors.primary} size={18} style={{ marginRight: Theme.spacing.sm, marginTop: 2 }} />
              <Text style={styles.infoText}>
                Submitting this listing launches the automated RentShield fraud pipeline. Processing normally completes within 3 minutes.
              </Text>
            </View>
          </View>
        )}

        {/* Wizard Footer Controls */}
        <View style={styles.formFooter}>
          {currentStep > 1 ? (
            <Button
              title="Back"
              icon={ArrowLeft}
              variant="outline"
              onPress={handleBack}
              style={styles.footerBtn}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <View style={{ width: 12 }} />

          {currentStep < 5 ? (
            <Button
              title="Next Step"
              icon={ArrowRight}
              variant="primary"
              onPress={handleNext}
              style={styles.footerBtn}
            />
          ) : (
            <Button
              title="Submit Property"
              icon={CheckCircle2}
              variant="success"
              onPress={handleSubmit}
              style={styles.footerBtn}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: Theme.spacing.lg,
  },
  progressCard: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xs,
  },
  stepBubbleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBubbleText: {
    fontFamily: Theme.typography.sans,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  stepLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 9,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    textAlign: 'center',
  },
  stepConnector: {
    height: 2,
    backgroundColor: Theme.colors.border,
    flex: 1,
    marginTop: -16, // align with bubble height center
  },
  formCard: {
    padding: Theme.spacing.xl,
  },
  stepBody: {
    minHeight: 320,
  },
  formHeader: {
    fontFamily: Theme.typography.sans,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  formSubheader: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xl,
  },
  dropdownContainer: {
    marginBottom: Theme.spacing.md,
  },
  dropdownLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  categoryPillActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryPillText: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  amenitiesGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    width: Platform.OS === 'web' ? '30%' : '100%',
    minWidth: Platform.OS === 'web' ? 180 : '100%',
  },
  amenityItemActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.lightBlue,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 4,
    marginRight: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  amenityText: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  amenityTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  uploadArea: {
    height: 160,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: Theme.radius.large,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    marginBottom: Theme.spacing.xl,
  },
  uploadTitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.sm,
  },
  uploadSubtitle: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  browseButtonVisual: {
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.medium,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: Theme.typography.sans,
    marginTop: Theme.spacing.xs,
    fontWeight: '600',
  },
  previewHeader: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  imagesPreviewScroll: {
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  previewImageCard: {
    width: 140,
    height: 140,
    borderRadius: Theme.radius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    position: 'relative',
    backgroundColor: '#000000',
    marginRight: Theme.spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  previewControlsTop: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.success,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Theme.typography.sans,
    letterSpacing: 0.5,
  },
  setCoverBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setCoverText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Theme.typography.sans,
  },
  reviewWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.10)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    marginBottom: Theme.spacing.xl,
  },
  reviewImage: {
    width: 70,
    height: 70,
    borderRadius: Theme.radius.small,
    marginRight: Theme.spacing.md,
  },
  reviewMain: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewName: {
    fontFamily: Theme.typography.sans,
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  reviewRent: {
    fontFamily: Theme.typography.sans,
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.primary,
    marginTop: 2,
  },
  reviewLoc: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  reviewDetailsList: {
    marginBottom: Theme.spacing.xl,
  },
  reviewDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.20)',
  },
  reviewDetailLabel: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  reviewDetailVal: {
    fontFamily: Theme.typography.sans,
    fontSize: 13,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '65%',
  },
  infoBanner: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.medium,
    alignItems: 'flex-start',
  },
  infoText: {
    fontFamily: Theme.typography.sans,
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    lineHeight: 15,
  },
  formFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
    paddingTop: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
  },
  footerBtn: {
    flex: 1,
  },
});
