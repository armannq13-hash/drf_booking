# from langdetect import detect, DetectorFactory
# from deep_translator import GoogleTranslator
import deepl
import os
from dotenv import load_dotenv

load_dotenv()
# ============HOTEL MODEL==============
def tranlsate_hotel_model(hotel):
    if not hotel.hotel_description:
        return
    
    # --------------------------
    
    supported_langs = {'en': 'EN-GB', 'kk': 'KK', 'ru': 'RU'}
    translator = deepl.Translator('f3d7538b-b82b-40b3-917b-b1de67195323:fx')
  
    for lang, target_code in supported_langs.items():
        try:
            translated_desc = translator.translate_text(
                hotel.hotel_description,
                target_lang=target_code,
            ).text
        except Exception as e:
            translated_desc = hotel.hotel_description
            print(f"{e} for {lang}")
        
        setattr(hotel, f"hotel_description_{lang}", translated_desc)
    
    hotel.save()
    
    # ------------------------
    # DetectorFactory.seed = 0
    # detected_lang_desc = detect(hotel.hotel_description)
    # detected_lang_name = detect(hotel.hotel_name)
    # setattr(hotel, f"hotel_description_{detected_lang_desc}", hotel.hotel_description)
    # setattr(hotel, f"hotel_name_{detected_lang_name}", hotel.hotel_name)
    
    # supported_langs = ['en', 'kk', 'ru']
    # for lang in supported_langs:
    #     if lang != detected_lang_desc:
    #         translator = GoogleTranslator(source='auto', target=lang)
    #         try:
    #             translated_desc = translator.translate(hotel.hotel_description)
    #             if 'error' in translated_desc:
    #                 translated_desc = hotel.hotel_description
    #         except Exception as e:
    #             print(f"{e} for {lang}")
    #             translated_desc = hotel.hotel_description
                
    #         setattr(hotel, f"hotel_description_{lang}", translated_desc)
            
    #     if lang != detected_lang_name:
    #         translator = GoogleTranslator(source='auto', target=lang)
    #         try:
    #             translated_name = translator.translate(hotel.hotel_name)
    #             if 'error' in translated_name:
    #                 translated_name = hotel.hotel_name
    #         except Exception as e:
    #             print(f"{e} for {lang}")
    #             translated_name = hotel.hotel_name
                
    #         setattr(hotel, f"hotel_name_{lang}", translated_name)
            
    # hotel.save()    
    
    
# ===========ROOM MODEL============
def translate_room_model(room):
    if not room.room_description:
        return

    # ------------------------
    supported_langs = {'en': 'EN-GB', 'kk': 'KK', 'ru': 'RU'}
    translator = deepl.Translator('f3d7538b-b82b-40b3-917b-b1de67195323:fx')
    
    for lang, target_code in supported_langs.items():
        try:
            translated_desc = translator.translate_text(
                room.room_description,
                target_lang=target_code,
            ).text
            
            if room.room_title:
                translated_title = translator.translate_text(
                    room.room_title,
                    target_lang=target_code
                ).text
        except Exception as e:
            translated_desc = room.room_description
            translated_title = room.room_title
            print(f"{e} for {lang}")
        
        setattr(room, f"room_description_{lang}", translated_desc)
        setattr(room, f"room_title_{lang}", translated_title)

    room.save()
    
 
# ============HOTEL FIELDS=============
def translate_hotel_description(hotel):
    if not hotel.hotel_description:
        return 
    
    supported_langs = {'en': 'EN-GB', 'kk': 'KK', 'ru': 'RU'}
    translator = deepl.Translator(os.getenv('DEEPL_API_KEY'))
    
    for lang, target_code in supported_langs.items():
        try:
            translated_description = translator.translate_text(
                hotel.hotel_description,
                target_lang=target_code
            ).text
        except Exception as e:
            translated_description = hotel.hotel_description
            print(f"{e} for {lang}")
            
        setattr(hotel, f"hotel_description_{lang}", translated_description)
        
    hotel.save()

  
# ============ROOM FIELDS===============
def translate_room_description(room):
    if not room.room_description:
        return
    
    supported_langs = {'en': 'EN-GB', 'kk': 'KK', 'ru': 'RU'}
    translator = deepl.Translator('f3d7538b-b82b-40b3-917b-b1de67195323:fx')
    
    for lang, target_code in supported_langs.items():
        try:
            translated_description = translator.translate_text(
                room.room_description,
                target_lang=target_code
            )
        except Exception as e:
            translated_description = room.room_description
            print(f"{e} for {lang}")
            
        setattr(room, f"room_description_{lang}", translated_description)
        
    room.save()
    

def translate_room_title(room):
    if not room.room_title:
        return
    
    supported_langs = {'en': 'EN-GB', 'kk': 'KK', 'ru': 'RU'}
    translator = deepl.Translator('f3d7538b-b82b-40b3-917b-b1de67195323:fx')
    
    for lang, target_code in supported_langs.items():
        try:
            translated_title = translator.translate_text(
                room.room_title,
                target_lang=target_code
            )
        except Exception as e:
            translated_title = room.room_title
            print(f"{e} for {lang}")
            
        setattr(room, f"room_title_{lang}", translated_title)
        
    room.save()

# ===============================================
# def translate_categories_model(category):
#     if not category.name:
#             return 
        
#     # ------------------------
#     supported_langs = {'en': 'EN-GB', 'kk': 'KK', 'ru': 'RU'}
#     translator = deepl.Translator('f3d7538b-b82b-40b3-917b-b1de67195323:fx')
    
#     for lang, target_code in supported_langs.items():
#         try:
#             translated_name = translator.translate_text(
#                 category.name,
#                 target_lang=target_code
#             ).text
#         except Exception as e:
#             translated_name = category.name
#             print(f"{e} for {lang}")
            
#         setattr(category, f"name_{lang}", translated_name)
        
#     category.save()
    
    