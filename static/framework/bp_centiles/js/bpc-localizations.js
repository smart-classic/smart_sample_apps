BPC.createLocale({ language : "English"  , langAbbr : "en" });
BPC.createLocale({ language : "Spanish",   langAbbr : "es" });
BPC.createLocale({ language : "Bulgarian", langAbbr : "bg" });

BPC.localizations = {
    STR_SHORT_TERM_VIEW_1  : { 
        en : "Short Term View",
        es : "Visión a corto plazo",
        bg : "Последни данни"
    },
    STR_LAST_THREE_BP_DAYS_2 : {
        en : "Shows the last three BP measurements, excluding those within a same day",
        es : "Muestra las últimas tres mediciones de la PA, con exclusión de los que están dentro de un mismo día",
        bg : "Последните три дни с измервания на кръвното налягане"
    },
    STR_LONG_TERM_VIEW_3 : {
        en : "Long Term View",
        es : "Visión a largo plazo",
        bg : "Всички данни" 
    },
    STR_TABLE_VIEW_4 : {
        en : "Table View",
        es : "Tabla",
        bg : "Таблица" 
    },
    STR_CALCULATOR_5 : {
        en : "Calculator",
        es : "Calculadora",
        bg : "Калкулатор" 
    },
    STR_REFERENCES_6 : {
        en : "References",
        es : "Referencias",
        bg : "Справки" // референции
    },
    STR_PRINT_7 : {
        en : "Print",
        es : "Imprimir",
        bg : "Принтирай" 
    },
    STR_ABOUT_SHORT_TERM_VIEW_8 : {
        en : "About the Short Term View",
        es : "Visión a corto plazo",
        bg : "Относно последните данни" 
    },
    STR_SHORT_TERM_VIEW_EXPLANATION_9 : {
        en : "The short term view displays blood pressure readings from the most recent three encounters where blood pressure was recorded.  For this summary view, only the last measurement is plotted for any given day.",
        es : "La visión de corto plazo muestra las lecturas de presión arterial desde los más los últimos tres encuentros que se registró la presión arterial. Por esta vista de resumen, sólo la última medición se traza para un día determinado.",
        bg : "Последните данни показват отчитането на кръвното налягане регистрирано през последните три пъти на неговото измерване." 
    },
    STR_SYSTOLIC_DIASTOLIC_CIRCLES_10 : {
        en : "Each measurement is represented by a pair of circles:  systolic (above) and diastolic (below). A circle's vertical position corresponds to the blood pressure value in mmHg. ",
        es : "Cada medición está representada por un par de círculos: sistólica (arriba) y diastólica (abajo). Posición vertical de un círculo corresponde a la valor de la presión arterial en mmHg.",
        bg : "Всяко измерване е представено от двойка кръгове: систоличен (над) и диастоличен (под). Вертикалната позиция на кръга съответства на стойностите на кръвното налягане измерени в mmHg." 
    },
    STR_PEDIATRIC_BP_VALUE_IN_CIRCLE_11 : {
        en : "For pediatric patients, a calculated blood pressure percentile  value is displayed inside each circle.  Since percentiles are based on a patient's height as well as blood pressure, a hyphen is displayed (-) in the absence of height data. ",
        es : "En los pacientes pediátricos, un análisis de sangre percentil presión calculada es aparece dentro de cada círculo. Desde percentiles se basan en un altura del paciente, así como la presión arterial, se muestra un guión (-) en la ausencia de datos de altura.",
        bg : "Перцентилната стойност на измереното кръвно налягане, отнасяща се за пациенти, в детска възраст е показана вътре във всеки кръг. Тъй като перцентилите са базирани на височината на пациента, така както и на кръвното му налягане, при липса на данни свързани с височината на пациента на това място се поставя тире (-). " 
    },
    STR_ADULT_READING_SYMBOL_12 : {
        en : "For adults, since diagnoses are not based on percentiles, a symbol indicates whether each reading was normal (OK<!--&#x2713;-->), prehypertensive (^) or hypertensive (/\).",
        es : "Para los adultos, ya que los diagnósticos no se basan en percentiles, un símbolo indica si cada lectura era normal (OK <- ✓ ->), prehipertensos (^) o hipertensiva (/ \).",
        bg : "Тък като при възрастните пациенти диагнозата не е базирана на перцентилите, се използва символ който индикира дали всяко отчитане е нормално (OK<!--&#x2713;-->), в състояние предхождащо хипертония  (^) или вече хипертонично (/\). " 
    },
    STR_TIP_13 : {
        en : "Tip",
        es : "Consejo",
        bg : "Съвет" 
    },
    STR_HOVER_FOR_DETAILS_14 : {
        en : "hover over a reading with the mouse for additional details.",
        es : "coloque el cursor sobre una lectura con el ratón para obtener más detalles.",
        bg : "за допълнителна информация раздвижете мишката върху данните с отчитането" 
    },
    STR_ADULT_BLOOD_PRESSURE_DATA_15 : {
        en : "The BPC application will use adult JNC7 guidelines for blood pressure data after age 19 for this patient.",
        es : "La aplicación BPC usará adultos directrices JNC7 de sangre datos de presión después de 19 años de edad para este paciente.",
        bg : "В приложението BPC ще участва възрастен пациент и ще се използват JNC7 указания за данни свързани с кръвното налягане за този пациент, след 19 годишната му възраст." 
    },
    STR_LAUNCHED_OUTSIDE_SMART_DEMO_MODE_16 : {
        en : "The BPC application was launched outside a SMART container and will run in DEMO mode.",
        es : "La aplicación BPC se puso en marcha fuera de un contenedor y de SMART se ejecutará en modo DEMO.",
        bg : "BPC приложението стартира извън SMART платформата и ще се задейства в демо режим." 
    },
    STR_INPATIENT_17 : {
        en : "Inpatient",
        es : "Hospitalización",
        bg : "Стационарен" //болничен
    },
    STR_AMBULATORY_18 : {
        en : "Ambulatory",
        es : "Аmbulatorio",
        bg : "Амбулаторен" //извън болничен
    },
    STR_UNKNOWN_19 : {
        en : "Unknown",
        es : "Desc.",
        bg : "Неизв." 
    },
    STR_ARM_20 : {
        en : "Arm",
        es : "Brazo",
        bg : "Ръка" 
    },
    STR_LEG_21 : {
        en : "Leg",
        es : "Pierna",
        bg : "Крак" 
    },
    STR_SITTING_23 : {
        en : "Sitting",
        es : "Sentado",
        bg : "Седящ" 
    },
    STR_STANDING_24 : {
        en : "Standing",
        es : "Permanente",
        bg : "Изправен" 
    },
    STR_AUSCULTATION_26 : {
        en : "Auscultation",
        es : "Аuscultación",
        bg : "Преслушване" 
    },
    STR_MACHINE_27 : {
        en : "Machine",
        es : "Аparato",
        bg : "Апарат" 
    },
    STR_PEDIATRIC_CALCULATOR_29 : {
        en : "Pediatric Percentile Calculator",
        es : "Calculadora Percentil Pediátrica",
        bg : "Педиатричен Перцентилен Калкулатор" 
    },
    STR_PATIENT_30 : {
        en : "Patient",
        es : "Paciente",
        bg : "Пациент" 
    },
    STR_AGE_31 : {
        en : "Age",
        es : "Еdad",
        bg : "Възраст" 
    },
    STR_Y_32 : {
        en : "y",
        es : "a",
        bg : "г" 
    },
    STR_M_33 : {
        en : "m",
        es : "m",
        bg : "м" 
    },
    STR_HEIGHT_34 : {
        en : "Height",
        es : "Аltura",
        bg : "Височина" 
    },
    STR_CM_35 : {
        en : "cm",
        es : "cm",
        bg : "см" 
    },
    STR_GENDER_36 : {
        en : "Gender",
        es : "Género",
        bg : "Пол" 
    },
    STR_MALE_37 : {
        en : "Male",
        es : "Мacho",
        bg : "Мъж" 
    },
    STR_FEMALE_38 : {
        en : "Female",
        es : "Femenino",
        bg : "Жена" 
    },
    STR_SYSTOLIC_39 : {
        en : "Systolic",
        es : "Sistólico",
        bg : "Систолично" 
    },
    STR_DIASTOLIC_40 : {
        en : "Diastolic",
        es : "Diastólicо",
        bg : "Диастолично" 
    },
    STR_THRESHOLDS_41 : {
        en : "Thresholds",
        es : "Umbrales",
        bg : "Прагови стойности" 
    },
    STR_LOAD_YEAR_46 : {
        en : "load another year",
        es : "cargar otro año",
        bg : "зареди друга година" 
    },
    STR_DATE_47 : {
        en : "Date",
        es : "Fecha",
        bg : "Дата" 
    },
    STR_AGE_48 : {
        en : "Age",
        es : "Еdad",
        bg : "Възраст" 
    },
    STR_HEIGHT_49 : {
        en : "Height",
        es : "Аltura",
        bg : "Височина" 
    },
    STR_BLOOD_PRESSURE_50 : {
        en : "Blood Pressure",
        es : "Presión Arterial",
        bg : "Кръвно" 
    },
    STR_PERCENTILES_51 : {
        en : "Percentiles",
        es : "Percentiles",
        bg : "Перцентили" 
    },
    STR_SITE_52 : {
        en : "Site",
        es : "Sitio",
        bg : "Mясто" 
    },
    STR_POSITION_53 : {
        en : "Position",
        es : "Posición",
        bg : "Позиция" 
    },
    STR_METHOD_54 : {
        en : "Method",
        es : "Método",
        bg : "Метод" 
    },
    STR_ENCOUNTER_55 : {
        en : "Encounter",
        es : "Encontrar",
        bg : "Преглед" 
    },
    STR_SYSTOLIC_BP_56 : {
        en : "Systolic BP",
        es : "Sistólico BP",
        bg : "Систолично КН" 
    },
    STR_DIASTOLIC_BP_57 : {
        en : "Diastolic BP",
        es : "Diastólicо BP",
        bg : "Диастолично КН" 
    },
    STR_PERCENTILE_58 : {
        en : "Percentile",
        es : "Percentil",
        bg : "Процентил" 
    },
    STR_LANGUAGE_59 : {
        en : "Language",
        es : "Lenguaje",
        bg : "Език" 
    },
    
    STR_PRINT_100 : {
        en : "Print Now",
        es : "Imprimir",
        bg : "Принтирай"
    },
    STR_ALL_BP_PERCENTILES_101 : {
        en : "All BPs in Percentiles",
        es : "Todos los BPs en percentiles",
        bg : "Всички КН в перцентили"
    },
    STR_LAST_102 : {
        en : "Last ",
        es : "Últimos ",
        bg : "Последните "
    },
    STR_BP_103 : {
        en : "BPs",
        es : "BPs",
        bg : "КН"
    },
    STR_COMPLETE_DATA_104 : {
        en : "complete data available in BP Centiles app",
        es : "datos completos disponibles en BP percentiles aplicación",
        bg : "пълни данни в наличност в BP Centiles приложението"
    },
    STR_BP_CENTILES_REPORT_105 : {
        en : "BP Centiles Report",
        es : "BP informe centiles",
        bg : "BP Centiles Доклад"
    },
    STR_NOTE_ONLY_AMBULATORY_106 : {
        en : "Note: Only ambulatory blood pressures are displayed.",
        es : "Nota: Sólo se muestran la presión arterial ambulatoria.",
        bg : "Бележка: Изложени са само резултати от измерено кръвно налягане в извън болнична среда."
    },
    STR_GENDER_107 : {
        en : "gender",
        es : "género",
        bg : "пол"
    },
    STR_DOB_108 : {
        en : "dob",
        es : "fdn",
        bg : "днр"
    },
    STR_HEIGHT_109 : {
        en : "height",
        es : "altura",
        bg : "височина"
    },
    STR_ON_110 : {
        en : "on",
        es : "en",
        bg : "на"
    },
    STR_LAST_BP_TITLE_111 : {
        en : "Last BP on Most Recent 3 Clinic Days in mmHg",
        es : "Últimos BP sobre Más recientes 3 ​​días en la Clínica mmHg",
        bg : "Данни за кръвното налягане през последните 3 клинични дни измерени в mmHg"
    },
    STR_SYSTOLIC_112 : {
        en : "systolic",
        es : "sistólico",
        bg : "систолично" 
    },
    STR_DIASTOLIC_113 : {
        en : "diastolic",
        es : "diastólicо",
        bg : "диастолично" 
    },
    STR_NOTES_114 : {
        en : "notes",
        es : "notas",
        bg : "бележки"
    },
    STR_SEX_MALE : {
    	en : "male",
    	es : "macho",
        bg : "мъж"
    },
    STR_SEX_FEMALE : {
        en : "female",
        es : "femenino",
        bg : "жена"
    },
    STR_POSITION_STANDING : {
        en : "Standing",
        es : "Permanente",
        bg : "Изправен"
    },
    STR_POSITION_SITTING : {
        en : "Sitting",
        es : "Sentado",
        bg : "Седящ"
    },
    STR_SITE_LEG : {
        en : "Leg",
        es : "Pierna",
        bg : "Крак"
    },
    STR_SITE_ARM : {
        en : "Arm",
        es : "Brazo",
        bg : "Ръка"
    },
    STR_SITE_LEFT_LEG : {
        en : "Left Leg",
        es : "Pierna Izquierda",
        bg : "Ляв Крак"
    },
    STR_SITE_LEFT_ARM : {
        en : "Left Arm",
        es : "Brazo Izquierdo",
        bg : "Лява Ръка"
    },
    STR_SITE_RIGHT_LEG : {
        en : "Right Leg",
        es : "Pierna Derecha",
        bg : "Десен Крак"
    },
    STR_SITE_RIGHT_ARM : {
        en : "Right Arm",
        es : "Brazo Derecho",
        bg : "Дясна Ръка"
    },
    STR_ENCOUNTER_INPATIENT: {
        en : "Inpatient",
        es : "Hospitalización",
        bg : "Стационарен" //болничен 
    },
    STR_ENCOUNTER_AMBULATORY: {
        en : "Ambulatory",
        es : "Аmbulatorio",
        bg : "Амбулаторен" //извън болничен
    },
    STR_METHOD_MACHINE: {
        en : "Machine",
        es : "Аparato",
        bg : "Апарат" //болничен 
    },
    STR_METHOD_AUSCULTATION : {
        en : "Auscultation",
        es : "Аuscultación",
        bg : "Преслушване" 
    },
    STR_SYSTOLIC : {
        en : "Systolic",
        es : "Sistólico",
        bg : "Систолично" 
    },
    STR_DIASTOLIC : {
        en : "Diastolic",
        es : "Diastólicо",
        bg : "Диастолично" 
    },
    "STR_HYPOTENSION (< 1%)" : {
        en : "Hypotension (< 1%)",
        es : "Hipotensión (< 1%)",
        bg : "Хипотония (< 1%)" 
    },
    "STR_NORMAL" : {
        en : "Normal",
        es : "Normal",
        bg : "Нормално" 
    },
    "STR_PREHYPERTENSION (> 90%)" : {
        en : "Prehypertension (> 90%)",
        es : "Prehipertensión (> 90%)",
        bg : "Прехипертония (> 90%)" 
    },
    "STR_HYPERTENSION (> 95%)" : {
        en : "Hypertension (> 95%)",
        es : "Hipertensión (> 95%)",
        bg : "Хипертония (> 95%)" 
    },
    STR_LEGEND: {
        en : "Legend",
        es : "Leyenda",
        bg : "Легенда" 
    },
    STR_HELP : {
        en : "Help",
        es : "Ayudar",
        bg : "Помощ" 
    },
    STR_PATIENT : {
        en : "Patient",
        es : "Paciente",
        bg : "Пациент" 
    },
    STR_BP : {
        en : "BP",
        es : "PA", //presión arterial
        bg : "КН" 
    },
    STR_OTHER : {
        en : "Other",
        es : "Оtro",
        bg : "Друго" 
    },
    STR_VAXIS_LABEL_MMHG : {
    	en : "mmHg",
        es : "mmHg",
        bg : "mmHg"
    },
    STR_VAXIS_LABEL_PERCENTILE : {
    	en : "Percentile",
        es : "Percentile",
        bg : "Процент"
    },
    STR_GENDER_FEMALE : {
        en : "female",
        es : "femenino",
        bg : "жена" 
    },
    STR_GENDER_MALE : {
        en : "male",
        es : "macho",
        bg : "мъж" 
    }
  
};