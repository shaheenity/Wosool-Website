const fs = require('fs');

const rawData = fs.readFileSync('c:\\Users\\Shaheen\\Desktop\\وصول\\schools_26.json', 'utf8');
const schools = JSON.parse(rawData);

const mappedSchools = schools.map((s, index) => {
    const score = parseInt(s["مدى جاهزية المدرسة لاستقبال الطلبة من ذوي الإعاقة"]) || 0;
    let readiness = "غير مهيأة";
    if (score >= 4) readiness = "مهيأة";
    else if (score >= 2) readiness = "جزئي";

    const readinessText = [
        "غير مهيأة",
        "غير مهيأة",
        "جزئي",
        "جاهزية متوسطة",
        "جاهزية عالية",
        "جاهزية كاملة"
    ][score] || "غير مهيأة";

    return {
        id: (index + 1).toString(),
        name: s["اسم المدرسة"].trim(),
        name_en: "", // Placeholder
        type: s["نوع المدرسة"] === "خاص" ? "خاصة" : "حكومية",
        level: s["المراحل التعليمية في المدرسة"].includes("ثانوي") ? "ثانوي" : "أساسي",
        gender: s["جنس المدرسة"] === "مختلطة" ? "مختلط" : s["جنس المدرسة"],
        district: s["موقع المدرسة (على خرائط جوجل)"] || "العقبة",
        district_en: "",
        address: s["موقع المدرسة (على خرائط جوجل)"] || "العقبة",
        phone: s["رقم الهاتف أو البريد الإلكتروني"] || "",
        lat: 29.531, // Placeholder
        lng: 35.006, // Placeholder
        rating: 4.0,
        readiness: readiness,
        infrastructure: {
            ramps: s["هل تحتوي المدرسة على مداخل مهيأة (منحدرات)؟"] === "نعم" || s["هل تحتوي المدرسة على مداخل مهيأة (منحدرات)؟"] === "جزئيَا",
            elevators: s["هل يوجد مصاعد في المدرسة (إن كانت متعددة الطوابق)؟"] === "نعم",
            adaptedBathrooms: s["مدى توفر دورات مياه مهيأة لذوي الإعاقة"].includes("متوفرة"),
            suitableCorridors: s["هل الممرات داخل المدرسة واسعة وآمنة للحركة بالكراسي المتحركة؟"] === "نعم" || s["هل الممرات داخل المدرسة واسعة وآمنة للحركة بالكراسي المتحركة؟"] === "إلى حد ما",
            signage: s["هل تتوفر لوحات إرشادية واضحة وسهلة الفهم؟"] === "نعم"
        },
        facilities: {
            supportiveMaterials: s["هل توفر المدرسة وسائل تعليمية داعمة (مثل: كتب مكبرة، وسائل سمعية، تقنيات مساعدة)؟"] === "نعم" || s["هل توفر المدرسة وسائل تعليمية داعمة (مثل: كتب مكبرة، وسائل سمعية، تقنيات مساعدة)؟"] === "جزئيّا",
            resourceRooms: s["هل يوجد غرف متعددة التخصصات؟"] === "نعم",
            specializedTeachers: s["هل يوجد معلمون مساندون (فريق متعدد التخصصات)؟"] === "نعم"
        },
        services: {
            integrationPrograms: s["هل تقدم المدرسة برامج دمج للطلبة من ذوي الإعاقة؟"] === "نعم",
            readinessLevel: readinessText
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
});

console.log(JSON.stringify(mappedSchools, null, 2));
