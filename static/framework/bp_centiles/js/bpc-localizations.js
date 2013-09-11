BPC.createLocale({ language : "English"  , langAbbr : "en" });
BPC.createLocale({ language : "Spanish",   langAbbr : "es" });
BPC.createLocale({ language : "Bulgarian", langAbbr : "bg" });

BPC.localizations = {
    STR_1  : { 
        en : "Short Term View",
        es : "Visión a corto plazo",
        bg : "Последни данни"
    },
    STR_2 : {
        en : "Shows the last three BP measurements, excluding those within a same day",
        es : "Muestra las últimas tres mediciones de la PA, con exclusión de los que están dentro de un mismo día",
        bg : "Последните три дни с измервания на кръвното налягане"
    },
    STR_3 : {
        en : "Long Term View",
        es : "Visión a largo plazo",
        bg : "Всички данни" 
    },
    STR_4 : {
        en : "Table View",
        es : "Tabla",
        bg : "Таблица" 
    },
    STR_5 : {
        en : "Calculator",
        es : "Calculadora",
        bg : "Калкулатор" 
    },
    STR_6 : {
        en : "References",
        es : "Referencias",
        bg : "Справки" // референции
    },
    STR_7 : {
        en : "Print",
        es : "Imprimir",
        bg : "Принтирай" 
    },
    STR_8 : {
        en : "About the Short Term View",
        es : "Visión a corto plazo",
        bg : "Относно последните данни" 
    },
    STR_9 : {
        en : "The short term view displays blood pressure readings from the most recent three encounters where blood pressure was recorded.  For this summary view, only the last measurement is plotted for any given day.",
        es : "La visión de corto plazo muestra las lecturas de presión arterial desde los más los últimos tres encuentros que se registró la presión arterial. Por esta vista de resumen, sólo la última medición se traza para un día determinado.",
        bg : "Последните данни показват отчитането на кръвното налягане регистрирано през последните три пъти на неговото измерване." 
    },
    STR_10 : {
        en : "Each measurement is represented by a pair of circles:  systolic (above) and diastolic (below). A circle's vertical position corresponds to the blood pressure value in mmHg. ",
        es : "Cada medición está representada por un par de círculos: sistólica (arriba) y diastólica (abajo). Posición vertical de un círculo corresponde a la valor de la presión arterial en mmHg.",
        bg : "Всяко измерване е представено от двойка кръгове: систоличен (над) и диастоличен (под). Вертикалната позиция на кръга съответства на стойностите на кръвното налягане измерени в mmHg." 
    },
    STR_11 : {
        en : "For pediatric patients, a calculated blood pressure percentile  value is displayed inside each circle.  Since percentiles are based on a patient's height as well as blood pressure, a hyphen is displayed (-) in the absence of height data. ",
        es : "En los pacientes pediátricos, un análisis de sangre percentil presión calculada es aparece dentro de cada círculo. Desde percentiles se basan en un altura del paciente, así como la presión arterial, se muestra un guión (-) en la ausencia de datos de altura.",
        bg : "Перцентилната стойност на измереното кръвно налягане, отнасяща се за пациенти, в детска възраст е показана вътре във всеки кръг. Тъй като перцентилите са базирани на височината на пациента, така както и на кръвното му налягане, при липса на данни свързани с височината на пациента на това място се поставя тире (-). " 
    },
    STR_12 : {
        en : "For adults, since diagnoses are not based on percentiles, a symbol indicates whether each reading was normal (OK<!--&#x2713;-->), prehypertensive (^) or hypertensive (/\).",
        es : "Para los adultos, ya que los diagnósticos no se basan en percentiles, un símbolo indica si cada lectura era normal (OK <- ✓ ->), prehipertensos (^) o hipertensiva (/ \).",
        bg : "Тък като при възрастните пациенти диагнозата не е базирана на перцентилите, се използва символ който индикира дали всяко отчитане е нормално (OK<!--&#x2713;-->), в състояние предхождащо хипертония  (^) или вече хипертонично (/\). " 
    },
    STR_13 : {
        en : "Tip: ",
        es : "Consejo: ",
        bg : "Съвет: " 
    },
    STR_14 : {
        en : "hover over a reading with the mouse for additional details.",
        es : "coloque el cursor sobre una lectura con el ratón para obtener más detalles.",
        bg : "за допълнителна информация раздвижете мишката върху данните с отчитането" 
    },
    STR_15 : {
        en : "The BPC application will use adult JNC7 guidelines for blood pressure data after age 19 for this patient.",
        es : "La aplicación BPC usará adultos directrices JNC7 de sangre datos de presión después de 19 años de edad para este paciente.",
        bg : "В приложението BPC ще участва възрастен пациент и ще се използват JNC7 указания за данни свързани с кръвното налягане за този пациент, след 19 годишната му възраст." 
    },
    STR_16 : {
        en : "The BPC application was launched outside a SMART container and will run in DEMO mode.",
        es : "La aplicación BPC se puso en marcha fuera de un contenedor y de SMART se ejecutará en modo DEMO.",
        bg : "BPC приложението стартира извън SMART платформата и ще се задейства в демо режим." 
    },
    STR_17 : {
        en : "Inpatient",
        es : "Hospitalización",
        bg : "Стационарен" //болничен
    },
    STR_18 : {
        en : "Ambulatory",
        es : "Аmbulatorio",
        bg : "Амбулаторен" //извън болничен
    },
    STR_19 : {
        en : "Unknown",
        es : "Desc.",
        bg : "Неизв." 
    },
    STR_20 : {
        en : "Arm",
        es : "Brazo",
        bg : "Ръка" 
    },
    STR_21 : {
        en : "Leg",
        es : "Pierna",
        bg : "Крак" 
    },
    STR_22 : {
        en : "Unknown",
        es : "Desc.",
        bg : "Неизв." 
    },
    STR_23 : {
        en : "Sitting",
        es : "Sentado",
        bg : "Седящ" 
    },
    STR_24 : {
        en : "Standing",
        es : "Permanente",
        bg : "Изправен" 
    },
    STR_25 : {
        en : "Unknown",
        es : "Desc.",
        bg : "Неизв." 
    },
    STR_26 : {
        en : "Auscultation",
        es : "Аuscultación",
        bg : "Преслушване" 
    },
    STR_27 : {
        en : "Machine",
        es : "Аparato",
        bg : "Апарат" 
    },
    STR_28 : {
        en : "Unknown",
        es : "Desc.", // Desconocido
        bg : "Неизв." 
    },
    STR_29 : {
        en : "Pediatric Percentile Calculator",
        es : "Calculadora Percentil Pediátrica",
        bg : "Педиатричен Перцентилен Калкулатор" 
    },
    STR_30 : {
        en : "Patient",
        es : "Paciente",
        bg : "Пациент" 
    },
    STR_31 : {
        en : "Age",
        es : "Еdad",
        bg : "Възраст" 
    },
    STR_32 : {
        en : "y",
        es : "a",
        bg : "г" 
    },
    STR_33 : {
        en : "m",
        es : "m",
        bg : "м" 
    },
    STR_34 : {
        en : "Height",
        es : "Аltura",
        bg : "Височина" 
    },
    STR_35 : {
        en : "cm",
        es : "cm",
        bg : "см" 
    },
    STR_36 : {
        en : "Gender",
        es : "Género",
        bg : "Пол" 
    },
    STR_37 : {
        en : "Male",
        es : "Мacho",
        bg : "Мъжки" 
    },
    STR_38 : {
        en : "Female",
        es : "Femenino",
        bg : "Женски" 
    },
    STR_39 : {
        en : "Systolic",
        es : "Sistólico",
        bg : "Систоличен" 
    },
    STR_40 : {
        en : "Diastolic",
        es : "Diastólicо",
        bg : "Диастоличен" 
    },
    STR_41 : {
        en : "Thresholds",
        es : "Umbrales",
        bg : "Прагови стойности" 
    },
    STR_42 : {
        en : "Charts",
        es : "Gráficos",
        bg : "Графики" 
    },
    STR_43 : {
        en : "Data",
        es : "Datos",
        bg : "Данни" 
    },
    STR_44 : {
        en : "Length",
        es : "Longitud",
        bg : "Дължина" 
    },
    STR_45 : {
        en : "Stature",
        es : "Estatura",
        bg : "Ръст" 
    },
    STR_46 : {
        en : "load another year",
        es : "cargar otro año",
        bg : "зареди друга година" 
    },
    STR_47 : {
        en : "Date",
        es : "Fecha",
        bg : "Дата" 
    },
    STR_48 : {
        en : "Age",
        es : "Еdad",
        bg : "Възраст" 
    },
    STR_49 : {
        en : "Height",
        es : "Аltura",
        bg : "Височина" 
    },
    STR_50 : {
        en : "Blood Pressure",
        es : "Presión Arterial",
        bg : "Кръвно" 
    },
    STR_51 : {
        en : "Percentiles",
        es : "Percentiles",
        bg : "Перцентили" 
    },
    STR_52 : {
        en : "Site",
        es : "Sitio",
        bg : "Mясто" 
    },
    STR_53 : {
        en : "Position",
        es : "Posición",
        bg : "Позиция" 
    },
    STR_54 : {
        en : "Method",
        es : "Método",
        bg : "Метод" 
    },
    STR_55 : {
        en : "Encounter",
        es : "Encontrar",
        bg : "Преглед" 
    },
    STR_56 : {
        en : "Systolic BP",
        es : "Sistólico BP",
        bg : "Систолично BP" 
    },
    STR_57 : {
        en : "Diastolic BP",
        es : "Diastólicо BP",
        bg : "Диастолично BP" 
    },
    STR_58 : {
        en : "Percentile",
        es : "Percentil",
        bg : "Процентил" 
    },
    STR_59 : {
        en : "Language: ",
        es : "Lenguaje: ",
        bg : "Език: " 
    },
    
    STR_100 : {
        en : "Print Now",
        bg : "Принтирай"
    },
    STR_101 : {
        en : "All BPs in Percentiles",
        es : "Todos los BPs en percentiles",
        bg : "Всички BPs в перцентили"
    },
    STR_102 : {
        en : "Last ",
        es : "Últimos ",
        bg : "Последните "
    },
    STR_103 : {
        en : " BPs",
        es : " BPs",
        bg : " BPs"
    },
    STR_104 : {
        en : "complete data available in BP Centiles app",
        es : "datos completos disponibles en BP percentiles aplicación",
        bg : "пълни данни в наличност в BP Centiles приложението"
    },
    STR_105 : {
        en : "BP Centiles Report",
        es : "BP informe centiles",
        bg : "BP Centiles Доклад"
    },
    STR_106 : {
        en : "Note: Only ambulatory blood pressures are displayed.",
        es : "Nota: Sólo se muestran la presión arterial ambulatoria.",
        bg : "Бележка: Изложени са само резултати от измерено кръвно налягане в извън болнична среда."
    },
    STR_107 : {
        en : "gender",
        es : "género",
        bg : "пол"
    },
    STR_108 : {
        en : "dob",
        es : "fdn",
        bg : "днр"
    },
    STR_109 : {
        en : "height",
        es : "altura",
        bg : "височина"
    },
    STR_110 : {
        en : "on",
        es : "en",
        bg : "на"
    },
    STR_111 : {
        en : "Last BP on Most Recent 3 Clinic Days in mmHg",
        es : "Últimos BP sobre Más recientes 3 ​​días en la Clínica mmHg",
        bg : "Данни за кръвното налягане през последните 3 клинични дни измерени в mmHg"
    },
    STR_112 : {
        en : "systolic",
        es : "sistólico",
        bg : "систоличен" 
    },
    STR_113 : {
        en : "diastolic",
        es : "diastólicо",
        bg : "диастоличен" 
    },
    STR_114 : {
        en : "notes",
        es : "notas",
        bg : "бележки"
    },
    STR_SMART_sex_male : {
    	en : "male",
    	es : "macho",
        bg : "мъжки"
    },
    STR_SMART_sex_female : {
        en : "female",
        es : "femenino",
        bg : "женски"
    },
    STR_SMART_position_Standing : {
        en : "Standing",
        es : "Permanente",
        bg : "Изправен"
    },
    STR_SMART_position_Sitting : {
        en : "Sitting",
        es : "Sentado",
        bg : "Седящ"
    },
    STR_SMART_site_Leg : {
        en : "Leg",
        es : "Pierna",
        bg : "Крак"
    },
    STR_SMART_site_Arm : {
        en : "Arm",
        es : "Brazo",
        bg : "Ръка"
    },
    STR_SMART_encounter_Inpatient: {
        en : "Inpatient",
        es : "Hospitalización",
        bg : "Стационарен" //болничен 
    },
    STR_SMART_encounter_Ambulatory : {
        en : "Ambulatory",
        es : "Аmbulatorio",
        bg : "Амбулаторен" //извън болничен
    },
    STR_SMART_method_Machine: {
        en : "Machine",
        es : "Аparato",
        bg : "Апарат" //болничен 
    },
    STR_SMART_method_Auscultation : {
        en : "Auscultation",
        es : "Аuscultación",
        bg : "Преслушване" 
    },
    STR_SMART_sys_Systolic : {
        en : "Systolic",
        es : "Sistólico",
        bg : "Систоличен" 
    },
    STR_SMART_sys_Diastolic : {
        en : "Diastolic",
        es : "Diastólicо",
        bg : "Диастоличен" 
    },
    "STR_SMART_Hypotension (< 1%)" : {
        en : "Hypotension (< 1%)",
        es : "Hipotensión (< 1%)",
        bg : "Хипотония (< 1%)" 
    },
    "STR_SMART_Normal" : {
        en : "Normal",
        es : "Normal",
        bg : "Нормално" 
    },
    "STR_SMART_Prehypertension (> 90%)" : {
        en : "Prehypertension (> 90%)",
        es : "Prehipertensión (> 90%)",
        bg : "Прехипертония (> 90%)" 
    },
    "STR_SMART_Hypertension (> 95%)" : {
        en : "Hypertension (> 95%)",
        es : "Hipertensión (> 95%)",
        bg : "Хипертония (> 95%)" 
    },
    STR_SMART_Legend: {
        en : "Legend",
        es : "Leyenda",
        bg : "Легенда" 
    },
    STR_SMART_help : {
        en : "Help",
        es : "Ayudar",
        bg : "Помощ" 
    },
    STR_SMART_SYSTOLIC : {
        en : "SYSTOLIC",
        es : "SYSTOLICO",
        bg : "СИСТОЛИЧЕН" 
    },
    STR_SMART_DIASTOLIC : {
        en : "DIASTOLIC",
        es : "DIASTOLICO",
        bg : "ДИАСТОЛИЧЕН" 
    },
    STR_SMART_Patient : {
        en : "Patient",
        es : "Paciente",
        bg : "Пациент" 
    },
    STR_SMART_BP : {
        en : "BP",
        es : "PA", //presión arterial
        bg : "КН" 
    },
    STR_SMART_Other : {
        en : "Other",
        es : "Оtro",
        bg : "Друго" 
    },
    STR_VAXIS_LABEL_mmHg : {
    	en : "mmHg",
        es : "mmHg",
        bg : "mmHg"
    },
    STR_VAXIS_LABEL_Percentile : {
    	en : "Percentile",
        es : "Percentile",
        bg : "Процент"
    },
    STR_SMART_gender_female : {
        en : "female",
        es : "femenino",
        bg : "женски" 
    },
    STR_SMART_gender_male : {
        en : "male",
        es : "macho",
        bg : "мъжки" 
    }

    
};