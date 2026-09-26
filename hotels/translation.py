from modeltranslation.translator import register, TranslationOptions
from .models import Hotel, RoomType, Facilities, RoomCategory

@register(Hotel)
class HotelTranslationOption(TranslationOptions):
    fields = ['hotel_description']
    
@register(RoomType)
class RoomTypeTranslationOption(TranslationOptions):
    fields = ['room_description', 'room_title']
    
@register(Facilities)
class FacilitiesTranslationOption(TranslationOptions):
    fields = ['name']
    
@register(RoomCategory)
class RoomCategoryTranslationOption(TranslationOptions):
    fields = ['name']